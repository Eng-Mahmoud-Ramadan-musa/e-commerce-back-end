import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {  Document, HydratedDocument, SchemaTypes, Types } from "mongoose";
import slugify from "slugify";
import { ImageSchema, IImage } from "src/Common";
import { User } from "../User/user.schema";

@Schema({timestamps: true})
// schema class
export class Category{
@Prop(({type: String, required: true, unique: true , trim: true}))
name: string

@Prop(({type: String, default: function(){
    return slugify(this.name);
}, unique: true , trim: true}))
slug: string


@Prop(({type: ImageSchema}))
image: IImage

@Prop({type: SchemaTypes.ObjectId, ref: User.name, required: true})
createdBy: Types.ObjectId

}
// Schema
export const categorySchema = SchemaFactory.createForClass(Category)

// user type
export type  TCategory = HydratedDocument<Category> & Document;

