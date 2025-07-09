import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {  Document, HydratedDocument } from "mongoose";
import { otpSchema, PROVIDERS, ROLES, IOtp } from "../../../Common";
import { ImageSchema } from "../../../Common/schemas/image.schema";

@Schema({timestamps: true})
// schema class
export class User{
@Prop(({type: String, required: true}))
userName: string

@Prop()
email: string

@Prop({
    type: String,
    required: function (this: User) {
      return this.provider === PROVIDERS.System;
    },
  })
phone: string

@Prop(({type: String,     
    required: function (this: User) {
    return this.provider === PROVIDERS.System;
  },
}))
password: string

@Prop(({type: Boolean, default: false}))
isDeleted: boolean

@Prop({type: Boolean, default: false})
isConfirmed: boolean

@Prop({type: Boolean, default: false})
enableStep_2fa: boolean

@Prop({type: String,enum: ROLES,default: ROLES.User})
role: string

@Prop({type: Date, required: false})
DOB: Date

@Prop({type: String,enum: PROVIDERS,default: PROVIDERS.System})
provider: string

@Prop({ type: () => ImageSchema })
profilePic: ImageSchema;

@Prop({type: [otpSchema]})
OTP: IOtp[];
}
// Schema
export const userSchema = SchemaFactory.createForClass(User)


// user type
export type  TUser = HydratedDocument<User> & Document;

export const connectedUsers = new Map<string, string>();
