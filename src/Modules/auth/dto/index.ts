import { Type } from "class-transformer"
import { IsEmail, IsEnum, IsMobilePhone, IsNotEmpty, IsObject, IsOptional, IsString, IsStrongPassword, Length, Matches, MinLength, Validate, ValidateIf } from "class-validator"
import { SUBJECTS, IImage } from "src/Common"
import { IsMatchPasswordConstraint } from "src/Common/Pipes/matchPassword"

export class SignupAuthDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    userName: string

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    @IsMobilePhone('ar-EG', {}, {
        message: 'Phone number must be a valid Egyptian mobile number',
      })
    phone: string

    @IsStrongPassword()
    @IsNotEmpty()
    password: string

    @IsStrongPassword()
    @IsNotEmpty()
    @ValidateIf((o) => o.password)
    @Validate(IsMatchPasswordConstraint)
    confirmPassword: string;

    @IsOptional()
    @IsObject()
    @Type(() => Object) 
    image?: IImage;

    @IsString()
    @IsOptional()
    DOB: Date
    
    @IsString()
    @IsNotEmpty()
    gender: string
}
export class SigninAuthDto {
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string
}

export class ConfirmEmailDto {
    
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Length(6, 6)
    otp: string;
}

export class SigninGoogleDto {
    @IsString()
    @IsNotEmpty()
    idToken: string
}

export class RefreshTokenDto {
    
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}

export class sendOtpDto {
    
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsEnum(SUBJECTS)
    @IsNotEmpty()
    subject: string
}

export class ResetPasswordDto {
    
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsStrongPassword()
    @IsNotEmpty()
    password: string

    @IsStrongPassword()
    @IsNotEmpty()
    @ValidateIf((o) => o.password)
    @Validate(IsMatchPasswordConstraint)
    confirmPassword: string;
    
    @IsString()
    @IsNotEmpty()
    @Length(6, 6)
    otp: string
}

export class SigninStep2faDto {
    
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Length(6, 6)
    otp: string;
}
