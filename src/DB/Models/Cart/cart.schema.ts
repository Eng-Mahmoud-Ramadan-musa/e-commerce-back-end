import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {  Document, HydratedDocument, SchemaTypes, Types } from "mongoose";
import { ICartItem } from "src/Common";
import { User } from "../User/user.schema";
import { Product } from "../Product/product.schema";


@Schema({timestamps: true})
// schema class
export class Cart{
@Prop({type: [{
    productId: {type: SchemaTypes.ObjectId, ref: Product.name, required: true},
    quantity: {type: Number, default: 1}
}]})
products: ICartItem[]

@Prop({type: SchemaTypes.ObjectId, ref: User.name, required: true, unique: true})
createdBy: Types.ObjectId;

}
// Schema
export const cartSchema = SchemaFactory.createForClass(Cart)

// user type
export type  TCart = HydratedDocument<Cart> & Document;

