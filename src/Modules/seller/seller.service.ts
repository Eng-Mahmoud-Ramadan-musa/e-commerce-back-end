import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository, UserRepository, TProduct, TUser, OrderRepository, TCart } from 'src/DB';
import { CreateProductDto, UpdateProductDto } from './dto';
import { Types } from 'mongoose';
import slugify from 'slugify';
import { DISCOUNT_TYPE, IOrderItem } from 'src/Common';


@Injectable()
export class SellerService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly userRepository: UserRepository,
    private readonly orderRepository: OrderRepository
  ) {}
  async getMyProducts(user: TUser) {
    const products = await this.productRepository.find({filter: {createdBy: user._id}, populate:{path: 'category', select: 'name'}});
    return products
  }

  async addProduct(createProductDto: CreateProductDto, user: TUser) {
    const product = await this.productRepository.create({...createProductDto, createdBy: user._id} as unknown as TProduct);
    
    return {message: 'product created successfully'}
  }

  async updateProduct(id: string,updateProductDto: UpdateProductDto) {
    
    let finalPrice = 0;
    if (updateProductDto.discount !== undefined && updateProductDto.discountType !== undefined) {
      finalPrice = 
        updateProductDto.discountType === DISCOUNT_TYPE.Fixed_Amount 
          ? Number(updateProductDto.price) - Number(updateProductDto.discount)
          : Number(updateProductDto.price) - (Number(updateProductDto.price) * Number(updateProductDto.discount)) / 100;
    }
    const product = await this.productRepository.findByIdAndUpdate(new Types.ObjectId(id), {...updateProductDto, updatedBy: new Types.ObjectId("680a8d40a08d64f8ca405684"), slug: updateProductDto.title && slugify(updateProductDto.title as string), finalPrice});
    if(!product) throw new NotFoundException("not found product or not authorized update this product");
    
    return {message: "product updated successfully"};
  }

  async removeProduct(id: string) {
    const result = await this.productRepository.delete({ _id: id });
    const message = result.deletedCount 
    ? "product deleted successfully"
    : "not found product or not authorized delete this product";
    return {message} 
  }

}
