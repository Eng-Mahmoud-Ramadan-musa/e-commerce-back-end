import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {  Document, HydratedDocument, SchemaTypes, Types } from "mongoose";
import { User } from "../User/user.schema";
import { IOrderItem, ORDER_STATUS, PAYMENT_METHOD } from "src/Common";
import { Cart } from "../Cart/cart.schema";
import { Product } from "../Product/product.schema";

@Schema({timestamps: true})
// schema class
export class Order{

@Prop(({type: String, required: true}))
address: string

@Prop(({type: String, required: true}))
phone: string

@Prop(({type: String, required: false}))
note?: string

@Prop(({type: String, required: false}))
intentId?: string

@Prop(({type: String, required: false}))
rejectedReason: string

@Prop(({type: String, required: false}))
paidAt: Date

@Prop({type: SchemaTypes.ObjectId, ref: User.name, required: true})
createdBy: Types.ObjectId

@Prop({type: SchemaTypes.ObjectId, ref: Cart.name, required: false})
updatedBy?: Types.ObjectId

@Prop(({type: Number, required: false}))
discount: number

@Prop(({type: String, required: true}))
subTotal: number

@Prop({type: Number, required: true})
finalPrice: number

@Prop(({type: String, enum: ORDER_STATUS,
    default: function(){
        return this.paymentMethod === PAYMENT_METHOD.Cash 
        ? ORDER_STATUS.Placed 
        : ORDER_STATUS.Pending
    }
}))
orderStatus: ORDER_STATUS

@Prop(({type: String, enum: PAYMENT_METHOD, default: PAYMENT_METHOD.Cash}))
paymentMethod: PAYMENT_METHOD


@Prop({type: [{
    productId: {type: SchemaTypes.ObjectId, ref: Product.name, required: true},
    title: String,
    price: Number,
    quantity: Number,
    finalPrice: {
        type: Number,
        default: function(){
            return this.price * this.quantity
        }
    },
}],
required: true})
productItems: IOrderItem[]

@Prop(({type: Number, required: false}))
refundAmount: number

@Prop(({type: Date, required: false}))
refundDate: Date


}
// Schema
export const orderSchema = SchemaFactory.createForClass(Order)

// user type
export type  TOrder = HydratedDocument<Order> & Document;

