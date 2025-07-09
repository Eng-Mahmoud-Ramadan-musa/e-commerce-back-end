import { IsEnum, IsInt, IsMobilePhone, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { PAYMENT_METHOD } from "src/Common";

export class CreateOrderDto {

    @IsString()
    @MinLength(3)
    @MaxLength(1000)
    address:string;

    @IsMobilePhone('ar-EG', { strictMode: false }, {
      message: 'Phone number must be a valid Egyptian mobile number',
    })
    phone:string;

    @IsString()
    @IsOptional()
    @MaxLength(5000)
    @MinLength(3)
    note?:string;

    @IsString()
    @IsEnum(PAYMENT_METHOD)
    @IsOptional()
    paymentMethod: PAYMENT_METHOD;

    @IsString()
    @IsOptional()
    coupon?: string;

    
}
