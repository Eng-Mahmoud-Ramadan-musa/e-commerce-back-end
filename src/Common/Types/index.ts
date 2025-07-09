import { Types } from "mongoose";

export interface IImageInImages {
    secure_url: string;
    public_id: string;
 }

export interface IImage extends IImageInImages {
   folderId: string;
}

export interface IOtp {
    code: string;
    subject: string;
    expiresIn: Date;
};

export interface ICartItem {
    productId: Types.ObjectId;
    quantity: number;
}

export interface IOrderItem {
    title: string;
    productId: Types.ObjectId;
    price: number;
    finalPrice: number;
    quantity: number;
}
