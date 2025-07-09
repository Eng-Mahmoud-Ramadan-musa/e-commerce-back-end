import { Module } from "@nestjs/common";
import { CategoryModel, CategoryRepository, MailModel, MailRepository, ProductModel, ProductRepository, UserModel, UserRepository } from "src/DB";
import { PublicService } from "./public.service";
import { PublicController } from "./public.controller";

@Module({
  imports: [ ProductModel, CategoryModel, MailModel],
  controllers: [PublicController],
  providers: [PublicService, ProductRepository, CategoryRepository, MailRepository],
})
export class PublicModule {};
