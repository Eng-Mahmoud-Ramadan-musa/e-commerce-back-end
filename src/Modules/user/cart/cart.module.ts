import { Module } from "@nestjs/common";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";
import { CartModel, CartRepository, ProductModel, ProductRepository } from "src/DB";

@Module({
  imports: [ProductModel, CartModel],
  controllers: [CartController],
  providers: [CartService, ProductRepository, CartRepository],
})
export class CartModule {}
