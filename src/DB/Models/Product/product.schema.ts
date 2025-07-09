import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, SchemaTypes, Types } from "mongoose";
import slugify from "slugify";
import { Category } from "../Category/category.schema";
import { User } from "../User/user.schema";
import { DISCOUNT_TYPE, ImagesSchema, IImageInImages } from "src/Common";


// schema class
@Schema({timestamps: true})
export class Product{
@Prop(({type: String, required: true, trim: true}))
title: string

@Prop(({type: String, default: function(){return slugify(this.title)}, trim: true}))
slug: string

@Prop(({type: String, trim: true}))
description: string

@Prop({type: SchemaTypes.ObjectId, ref: User.name, required: true})
createdBy: Types.ObjectId

@Prop({type: SchemaTypes.ObjectId,default: function(){return this.createdBy}, ref: User.name})
updatedBy: Types.ObjectId

@Prop({type: SchemaTypes.ObjectId, ref: Category.name, required: true})
category: Types.ObjectId

@Prop({type: Number, required: true, min: 1})
price: number

@Prop({type: Number, default: 0, min: 0})
discount: number

@Prop({type: String, enum: DISCOUNT_TYPE, default: "percentage"})
discountType: DISCOUNT_TYPE;

@Prop({type: Number, default: function(){
    return this.discountType === DISCOUNT_TYPE.Fixed_Amount 
    ? this.price - this.discount 
    : this.price - (this.price * this.discount / 100)
}})
finalPrice: number

@Prop({type: Number, default: 1, min: 0})
stock: number

@Prop({type: [ImagesSchema]})
images: IImageInImages[]

@Prop({type: String})
folderId: string

}
// Schema
export const productSchema = SchemaFactory.createForClass(Product)

// user type
export type TProduct = HydratedDocument<Product> & Document ;
