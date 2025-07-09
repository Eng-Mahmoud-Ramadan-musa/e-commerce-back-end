import { Module } from "@nestjs/common";
import { SellerController } from "./seller.controller";
import { SellerService } from "./seller.service";
import { GlobalAuthModule } from "src/Common/modules/globalAuth.module";
import { OrderModel, OrderRepository, ProductModel, ProductRepository } from "src/DB";

@Module({
  imports: [GlobalAuthModule,ProductModel, OrderModel],
  controllers: [SellerController],
  providers: [SellerService, ProductRepository, OrderRepository],
})
export class SellerModule {}
