import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { Types } from "mongoose";
import { DISCOUNT_TYPE, IImageInImages } from "src/Common";


class ImageDto {
    @IsString()
    secure_url: string;
  
    @IsString()
    public_id: string;
  }

export class CreateProductDto {

    @IsString()
    @IsNotEmpty()
    title: string

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    description: string

    @IsString()
    @IsNotEmpty()
    price: string

    @IsString()
    @IsOptional()
    discount: string

    @IsMongoId()
    @IsNotEmpty()
    category: Types.ObjectId

    @IsOptional()
    @IsEnum(DISCOUNT_TYPE)
    discountType: DISCOUNT_TYPE

    @IsString()
    @IsNotEmpty()
    stock: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImageDto)
    images: IImageInImages[]

    @IsString()
    @IsNotEmpty()
    folderId: string
    
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

