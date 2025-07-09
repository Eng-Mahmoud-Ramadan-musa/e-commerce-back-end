import { ForbiddenException, Injectable, NotFoundException, Type } from '@nestjs/common';
import { CreateOrderDto } from './dto';
import { CartRepository, OrderRepository, TOrder, TProduct, TUser } from 'src/DB';
import { ProductRepository } from 'src/DB';
import { IOrderItem, ICartItem, IdDto, ORDER_STATUS, PAYMENT_METHOD, ROLES } from 'src/Common'
import { PaymentService } from 'src/Common/Services/payment.service';
import Stripe from 'stripe';
import { Request } from 'express';
import { Types } from 'mongoose';
import { RealTimeGateway } from 'src/Modules/gateway/gateway';

@Injectable()
export class OrderService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
    private readonly orderRepository: OrderRepository,
    private readonly realTimeGateway: RealTimeGateway, 
    private paymentService: PaymentService  
  ) {}
  
async create(user: TUser, body: CreateOrderDto) {
  const cart = await this.cartRepository.findOne({
    filter: { createdBy: user._id },
    populate: [{ path: 'products.productId', select: 'title price discount finalPrice' }],
  });

  if (!cart || !cart.products.length) throw new NotFoundException('Empty cart');

  let subTotal = 0;
  let products: IOrderItem[] = [];

  for (const product of cart.products) {
    const productItem = await this.productRepository.findOne({
      filter: { _id: product.productId, stock: { $gte: product.quantity } },
    });

    if (!productItem) throw new NotFoundException(`Product not found`);

    products.push({
      title: productItem.title,
      productId: productItem._id,
      quantity: product.quantity,
      price: productItem.price,
      finalPrice: productItem.finalPrice,
    });

    subTotal += productItem.finalPrice * product.quantity;
  }

  const finalPrice = cart.products.reduce(
    (acc: number, product: ICartItem) => {
      const p = product.productId as unknown as TProduct;
      return acc + (p.finalPrice * product.quantity);
    }, 
    0
  );

  const order: Partial<TOrder> = {
    createdBy: user._id,
    paymentMethod: body.paymentMethod,
    address: body.address,
    phone: body.phone,
    productItems: products,
    discount: body.coupon ? Number(body.coupon) : undefined,
    subTotal,
    finalPrice,
  };

  const newOrder = await this.orderRepository.create(order);

  await this.cartRepository.delete({ createdBy: user._id });

  for (const product of products) {
    await this.productRepository.update({
      filter: { _id: product.productId }},{
      update: { $inc: { stock: -product.quantity } },
    });
  }
  this.realTimeGateway.sendOrderMessageToAdmins('created', newOrder._id.toString(), user.userName);

  return {
    message: 'Order created successfully',
    orderId: newOrder._id,
  };
}

async findAll(user: TUser) {
  const orders = await this.orderRepository.find({filter: {createdBy: user._id}});
    if(orders.length <= 0) throw new NotFoundException('Orders not found');
    return orders
  }

async webhook(req: Request) {
  return await this.paymentService.webhook(req);
}  

async checkout(user: TUser, params: IdDto) {
  const order = await this.orderRepository.findOne({filter: {
    _id: params.id,
    createdBy: user._id,
    orderStatus: ORDER_STATUS.Pending,
    paymentMethod: PAYMENT_METHOD.Card
  }});
  if (!order) throw new NotFoundException('Order not found');

let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];

if (order.discount && (Number(order.discount) > 0)) {
  const coupon = await this.paymentService.createCoupon({
    percent_off: Number(order.discount), // ✅ تأكد أنه رقم
    duration: 'once',
  });

  discounts.push({
    coupon: coupon.id,
  });
}

const session = await this.paymentService.checkoutSession(
    {
      customer_email: user.email,
      metadata: { order_id: order._id.toString() },
      line_items: order.productItems.map((item: IOrderItem) => ({
        price_data: {
          currency: 'egp',
          product_data: {
            name: item.title,
          },
          unit_amount: item.finalPrice * 100,
        },
        quantity: item.quantity,
      })),
      discounts,
      success_url: `${process.env.STRIPE_SUCCESS_URL}/${order._id}/order`,
      cancel_url: `${process.env.STRIPE_CANCEL_URL}/${order._id}/order`,
    }
  );
  const intent = await this.paymentService.createPaymentIntent(order.finalPrice);
  await this.orderRepository.update({filter: { _id: order._id }}, {update: { intentId: intent.id }});
  return session;
}

async getOrderById(user: TUser, id: string) {
  let order = await this.orderRepository.findById({
    id: new Types.ObjectId(id),
    populate: [
      {
        path: 'productItems.productId',
        select: 'title price discount finalPrice createdBy',
      },
    ],
  });

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  // تصفية المنتجات لو المستخدم بائع
  if (user.role === ROLES.Seller) {
    order.productItems = order.productItems.filter((item: IOrderItem) => {
      const createdBy = item.productId['createdBy'];
      return createdBy?._id?.toString() === user._id.toString();
    });
  }

  console.log(JSON.stringify(order, null, 2));
  return order;
}


async cancelOrder(user: TUser, orderId: string) {

  const createdBy = user.role === ROLES.Admin ? {} : { createdBy: user._id };
  const order = await this.orderRepository.findOne({filter: {
     _id: new Types.ObjectId(orderId),
     ...createdBy,
     orderStatus: { $in: [ORDER_STATUS.Pending, ORDER_STATUS.Placed] },
     }});
     console.log(order);
  // if (!order) throw new NotFoundException('Order not found');
    if (user.role === ROLES.Seller || !order) {
    throw new ForbiddenException(' You are not allowed to cancel this order');
    }
  let refund = {}
  if (
    order.paymentMethod == PAYMENT_METHOD.Card && 
    order.orderStatus == ORDER_STATUS.Placed 
  ) {
    refund = {refundAmount: order.finalPrice, refundDate: Date.now()}
    await this.paymentService.refundPayment(order.intentId as string);

  }

  await this.orderRepository.update({ 
    _id: order._id 
  }, {
    orderStatus: ORDER_STATUS.Cancelled,
    updatedBy: user._id,
    ...refund
  });
for (const item of order.productItems) {
  // تحديث المخزون
  await this.productRepository.update(
    { _id: item.productId },
    { $inc: { stock: item.quantity } }
  );

  // جلب بيانات المنتج للحصول على createdBy
  const fullProduct = await this.productRepository.findOne({ filter: { _id: item.productId } });

  if (!fullProduct) continue;

  const sellerId = fullProduct.createdBy?.toString();
  if (sellerId) {
    this.realTimeGateway.sendOrderMessageToSeller(
      sellerId,
      'cancelled',
      item.quantity,
      fullProduct.title,
      fullProduct.stock 
    );
  }
}


  this.realTimeGateway.sendOrderMessageUpdated(order, user);

  return {message: 'Order cancelled successfully'}
}

}
