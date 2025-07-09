import { Controller, Get, Post, Body, Param, Delete, Put, UseInterceptors, Req } from '@nestjs/common';
import { SellerService } from './seller.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Auth, ProductFilesUploadInterceptor, multerOptions, ROLES, User, IdDto } from 'src/Common';
import { TUser } from 'src/DB';

@Controller('seller')
@Auth(ROLES.Seller)
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get('products')
  getMyProducts(@User() user: TUser) {
    return this.sellerService.getMyProducts(user);
  }

  @Post('product')
  @UseInterceptors(FilesInterceptor('images', 5,multerOptions()), ProductFilesUploadInterceptor('product'))
  addProduct(@Body() createProductDto: CreateProductDto, @User() user: TUser) {
    return this.sellerService.addProduct(createProductDto, user);
  }

  @Put('product/:id')
  @UseInterceptors(FilesInterceptor('images', 5,multerOptions()), ProductFilesUploadInterceptor())
  updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    
    return this.sellerService.updateProduct(id, updateProductDto);
  }
  
  @Delete('product/:id')
  removeProduct(@Param('id') id: string) {
    return this.sellerService.removeProduct(id);
  }
  
}
