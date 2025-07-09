import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Types } from "mongoose";
import { DISCOUNT_TYPE, PRODUCT_SORT } from "src/Common";
import { SignupAuthDto } from "src/Modules/auth/dto";


export class SearchDto {
  @IsOptional()
  search?: string;

  @IsOptional()
  @IsString({ each: true })
  @Type(() => String) 
  category?: string[];

  @IsOptional()
  price?: string; // مثال: "50-200"

  @IsOptional()
  discount?: string;

  @IsOptional()
  @IsEnum(DISCOUNT_TYPE)
  discountType?: DISCOUNT_TYPE;

  @IsOptional()
  @IsEnum(PRODUCT_SORT)
  sort?: PRODUCT_SORT; 
}

export class UpdateUserDto extends PartialType(SignupAuthDto) {}

export class SendMailDto {

    @IsMongoId()
    @IsNotEmpty()
    receiver: Types.ObjectId

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(500)
    message: string

    @IsMongoId()
    @IsOptional()
    replyTo?: Types.ObjectId
}
