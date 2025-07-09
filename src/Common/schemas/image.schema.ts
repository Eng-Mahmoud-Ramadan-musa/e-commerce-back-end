import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { PROVIDERS } from "../Enums";
import { User } from "src/DB";

@Schema({timestamps: false, _id: false})
export class ImagesSchema{
    @Prop({type: String, required: true})
    secure_url: string;

    @Prop({type: String, required: function (this: User) {
          return this.provider === PROVIDERS.System;
        },})
    public_id: string;
}

@Schema({timestamps: false, _id: false})
export class ImageSchema extends ImagesSchema{
    @Prop({type: String, required: function (this: User) {
          return this.provider === PROVIDERS.System;
        },})
    folderId: string;
}

export const imageSchema = SchemaFactory.createForClass(ImageSchema);
export const imagesSchema = SchemaFactory.createForClass(ImagesSchema);
