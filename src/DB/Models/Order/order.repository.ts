import { DBService } from "src/DB/db.service";
import { TOrder, Order } from "./order.schema";
import { Model } from 'mongoose';
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class OrderRepository extends DBService<TOrder> {
    constructor(@InjectModel(Order.name) private readonly orderModel: Model<TOrder>) {
        super(orderModel)
    }
}