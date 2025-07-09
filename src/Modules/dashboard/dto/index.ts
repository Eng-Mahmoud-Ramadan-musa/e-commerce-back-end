import { Field, ID, InputType, registerEnumType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsString, IsMongoId, IsOptional, IsNotEmpty, ValidateNested, IsObject, IsEnum } from "class-validator";
import { Types } from "mongoose";
import { IImage } from "src/Common";

@InputType()
export class IImageInput {
  @Field(() => String)
  @IsString()
  secure_url: string;

  @Field(() => String)
  @IsString()
  public_id: string;

  @Field(() => String)
  @IsString()
  folderId?: string;
}

// rest api

export class AddCategoryInput {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @Type(() => Object)
  image: IImage;
}

export class EditCategoryInput {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsObject()
  @IsOptional()
  @Type(() => Object)
  image?: IImage;
}

// graphql
@InputType()
export class IdInput {
    @Field(() => ID)
    @IsMongoId()
    id: Types.ObjectId;
}

@InputType()
export class UpdateUserRoleInput extends IdInput {

  @Field(() => String)
  @IsString()
  role: string
}

@InputType()
export class ImageInput {
  @Field(() => String)
  public_id: string;

  @Field(() => String)
  secure_url: string;
}

@InputType()
export class UpdateStatusOrderInput extends IdInput {
  @Field(() => String)
  @IsString()
  orderStatus: string;
}
