import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { CartModel, CartRepository, OrderModel, OrderRepository, ProductModel, ProductRepository } from "src/DB";
import { PaymentService } from "src/Common/Services/payment.service";
import { RealTimeGateway } from "src/Modules/gateway/gateway";

@Module({
  imports: [CartModel, ProductModel, OrderModel],
  controllers: [OrderController],
  providers: [OrderService, CartRepository, ProductRepository, OrderRepository, PaymentService, RealTimeGateway],
})
export class OrderModule {}
