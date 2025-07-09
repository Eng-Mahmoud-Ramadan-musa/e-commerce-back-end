import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Types } from "mongoose";
import { IImage, IImageInImages, PROVIDERS, ROLES} from "src/Common";


@ObjectType({ isAbstract: true })
class ImageInImagesDto {
  @Field(() => String)
  secure_url: string;

  @Field(() => String)
  public_id: string;
}

@ObjectType({ isAbstract: true })
 class ImageDto extends ImageInImagesDto {

  @Field(() => String, {nullable: true})
  folderId?: string;
}

@ObjectType({ isAbstract: true })
 class IOtp {
  @Field(() => String)
  code: string;

  @Field(() => String)
  subject: string;

  @Field(() => Date)
  expiresIn: Date;
}

@ObjectType({ isAbstract: true })
export class IUserDto {
  
  @Field(() => ID)
  _id: Types.ObjectId;
  
  @Field(() => String)
  userName: string
  
  @Field(() => String)
  email: string
  
  @Field(() => String, { nullable: true })
  phone: string
  
  @Field(() => Boolean, { nullable: true })
  isDeleted: boolean
  
  @Field(() => Boolean, { nullable: true })
  isConfirmed: boolean
  
  @Field(() => Boolean, { nullable: true })
  enableStep_2fa: boolean
  
  @Field(() => String, {defaultValue: ROLES.User})
  role: string
  
  @Field(() => String, {defaultValue: PROVIDERS.System})
  provider: string
  
  @Field(() => ImageDto, {nullable: true})
  profilePic: IImage
  
  @Field(() => [IOtp], {defaultValue: []})
  OTP: IOtp[];

  @Field(() => Date, { nullable: true })
  createdAt: Date

  @Field(() => Date, { nullable: true })
  updatedAt: Date
}

@ObjectType({ isAbstract: true })
export class ICategory {
  @Field(() => ID)
  _id: Types.ObjectId;
  
  @Field(() => String)
  name: string;
  
  @Field(() => String)
  slug: string;
  
  @Field(() => ImageDto, {nullable: true})
  image: IImage
  
  @Field(() => IUserDto)
  createdBy: Types.ObjectId;

    @Field(() => Date)
  createdAt: Date;
  
  @Field(() => Date)
  updatedAt: Date;
  
}

@ObjectType({ isAbstract: true })
export class IProduct {
  @Field(() => ID)
  _id: Types.ObjectId;
  
  @Field(() => String)
  title: string;
  
  @Field(() => String)
  slug: string;
  
  @Field(() => IUserDto)
  createdBy: Types.ObjectId;
  
  @Field(() => IUserDto)
  updatedBy: Types.ObjectId;

  @Field(() => ICategory, {nullable: true})
  category: Types.ObjectId;

  @Field(() => String, {nullable: true})
  description: string;

  @Field(() => String, {nullable: true})
  price: number;

  @Field(() => String, {nullable: true})
  discount: number;

  @Field(() => String)
  discountType: string;

  @Field(() => String)
  finalPrice: number;

  @Field(() => String)
  stock: number;

  @Field(() => [ImageInImagesDto], {nullable: true})
  images: IImageInImages[]

  @Field(() => String)
  folderId: string;

  @Field(() => Date)
  createdAt: Date;
  
  @Field(() => Date)
  updatedAt: Date;
  
}

@ObjectType({ isAbstract: true })
export class IOrderDto {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field(() => IUserDto)
  createdBy: IUserDto

  @Field(() => String)
  title: string

  @Field(() => String)
  address: string

  @Field(() => String)
  paymentMethod: string

  @Field(() => String)
  orderStatus: string;

  @Field(() => [IProduct])
  productItems: IProduct[]
  
  @Field(() => Date)
  createdAt: Date;
  
  @Field(() => Date)
  updatedAt: Date;

}


