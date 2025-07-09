import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive } from "class-validator";
import { Types } from "mongoose";

export class AddProductDto {
    @IsNotEmpty()
    @IsMongoId()
    productId: Types.ObjectId;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    quantity?: number;
}


export class UpdateQuantityDto {
    
    @IsNotEmpty()
    @IsMongoId()
    productId: string

    @IsNumber()
    @IsPositive()
    quantity: number;
}

