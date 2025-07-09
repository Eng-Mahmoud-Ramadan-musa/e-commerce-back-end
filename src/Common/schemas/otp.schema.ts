import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SUBJECTS } from "..";

@Schema({timestamps: false, _id: false})
export class OtpSchema{
    @Prop({type: String, required: true})
    code: string;

    @Prop({type: String, enum: SUBJECTS, required: true})
    subject: string;

    @Prop({type: Date, required: true})
    expiresIn: Date;
}

export const otpSchema = SchemaFactory.createForClass(OtpSchema);