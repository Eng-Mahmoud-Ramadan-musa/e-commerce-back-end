import { DBService } from "src/DB/db.service";
import { TCart, Cart } from "./cart.schema";
import { Model } from 'mongoose';
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CartRepository extends DBService<TCart> {
    constructor(@InjectModel(Cart.name) private readonly cartModel: Model<TCart>) {
        super(cartModel)
    }

}