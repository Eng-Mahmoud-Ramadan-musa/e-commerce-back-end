import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, SchemaTypes, Types } from "mongoose";
import { User } from "../User/user.schema";

@Schema({ timestamps: true })
export class Mail {

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name, required: true })
  sender: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name, required: true })
  receiver: Types.ObjectId;

  @Prop({ type: String, required: true, minlength: 5 })
  message: string;

  // في حال الرسالة هي رد على رسالة أخرى
  @Prop({ type: SchemaTypes.ObjectId, ref: Mail.name, required: false })
  replyTo?: Types.ObjectId;

  @Prop({type: Boolean, default: false})
  isRead: boolean
}

export const mailSchema = SchemaFactory.createForClass(Mail);

export type TMail = HydratedDocument<Mail> & Document;
