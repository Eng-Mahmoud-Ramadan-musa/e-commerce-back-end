import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { OrderRepository } from 'src/DB';
import Stripe from 'stripe';
import { ORDER_STATUS } from '../Enums';

@Injectable()
export class PaymentService {
  private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  private readonly endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  constructor(
    private readonly orderRepository: OrderRepository 
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }

  async checkoutSession({
    customer_email,
      mode= 'payment',
      success_url= process.env.STRIPE_SUCCESS_URL,
      cancel_url= process.env.STRIPE_CANCEL_URL,
      metadata= {},
      line_items,
      discounts= [],
  }: Stripe.Checkout.SessionCreateParams): Promise<Stripe.Checkout.Session> {
    const session = await this.stripe.checkout.sessions.create({
      customer_email,
      mode,
      success_url,
      cancel_url,
      metadata,
      line_items,
      discounts,
    });

    return session
  }

  async createCoupon(params: Stripe.CouponCreateParams): Promise<Stripe.Coupon> {
    const coupon = await this.stripe.coupons.create(params);
    return coupon
  }

  async webhook(req: Request) {
  let body = req.body;
 const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

 const signature = req.headers['stripe-signature'];
 
 const event = this.stripe.webhooks.constructEvent(
        body,
        signature as string,
        endpointSecret as string,
      );
  
  if(event.type != 'checkout.session.completed') {
    throw new BadRequestException('Invalid checkout');
  }

  const order = await this.orderRepository.findOne({
    filter: {
      _id: event?.data?.object?.['metadata']?.order_id
    }});

  if(!order) throw new BadRequestException('Invalid order');

  await this.confirmPaymentIntent(order.intentId as string);

  await this.orderRepository.update({
    _id: event?.data?.object?.['metadata']?.order_id,
    orderStatus: ORDER_STATUS.Pending,
    createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }

  }, {
    orderStatus: ORDER_STATUS.Placed, 
    paidAt: new Date()
  });

  return 'done';
}

async createPaymentIntent(amount: number, currency: string = 'egp'): Promise<Stripe.PaymentIntent> {
  const paymentMethod = await this.createPaymentMethod();
  const intent = await this.stripe.paymentIntents.create({
    amount: amount * 100,
    currency,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never',
    },
    payment_method: paymentMethod.id 
  });
  return intent;
}

async createPaymentMethod(token: string = 'tok_visa'): Promise<Stripe.PaymentMethod> {
  const paymentMethod = await this.stripe.paymentMethods.create({
    type: 'card',
    card: {
      token,
    },
  });
  return paymentMethod
}

async retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
  const paymentIntent = await this.stripe.paymentIntents.retrieve(id);
  return paymentIntent;
}

async confirmPaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
  const intent = await this.retrievePaymentIntent(id);
  if(!intent) throw new BadRequestException('Invalid payment intent');
  const paymentIntent = await this.stripe.paymentIntents.confirm(intent.id, {
    payment_method: 'pm_card_visa' 
  });

  if(paymentIntent.status != 'succeeded') throw new BadRequestException('Payment failed');
  return paymentIntent;
  }

async refundPayment(id: string): Promise<Stripe.Response<Stripe.Refund>> {
  const refund = await this.stripe.refunds.create({
    payment_intent: id,
  });
  return refund;
}

}
