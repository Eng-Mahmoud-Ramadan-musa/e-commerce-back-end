
import { Controller, Get, Body, Param, Delete, HttpCode, Put, UseInterceptors, Patch, Post, Query } from '@nestjs/common';
import { PublicService } from './public.service';
import { Auth, IdDto, multerOptions, ROLES, User, UserFileUploadInterceptor} from '../../Common';
import { SearchDto, SendMailDto, UpdateUserDto } from '../public/dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { TUser } from 'src/DB';
// import { CacheInterceptor } from '@nestjs/cache-manager';


@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  // @UseInterceptors(CacheInterceptor)
  @Get('all-data')
  allData() {
    return this.publicService.allData()
  }

 @Get('search')
SearchProducts(@Query() query: SearchDto) {
  return this.publicService.getFilteredProducts(query);
}

  // @UseInterceptors(CacheInterceptor)
  @Get('users')
  getAllUsers() {
    return this.publicService.getAllUsers();
  }

  @Get('profile')
  @Auth( ROLES.User, ROLES.Seller)
  getProfile(@User() user: TUser) {
    return this.publicService.getProfile(user)
  }

  @Get('profile/:id')
  getSpecificProfile(@Param() idDto: IdDto) {
    return this.publicService.getSpecificProfile(idDto);
  }

  // @UseInterceptors(CacheInterceptor)
  @Get('products')
  getAllProducts() {
    return this.publicService.getAllProducts();
  }

  // @UseInterceptors(CacheInterceptor)
  @Get('product/:id')
  getSpecificProduct(@Param() id: IdDto) {
    return this.publicService.getSpecificProduct(id);
  }

  // @UseInterceptors(CacheInterceptor)
  @Get('categories')
  getAllCategories() {
    return this.publicService.getAllCategories();
  }

  @Get('category/:id')
  getSpecificCategory(@Param() id: IdDto) {
    return this.publicService.getSpecificCategory(id);
  }

  // @UseInterceptors(CacheInterceptor)
  @Get('discounts')
  getAllDiscounts(){
    return this.publicService.getDiscounts()
  }

  @Put('profile')
  @Auth( ROLES.User, ROLES.Seller, ROLES.Admin)
  @UseInterceptors(FileInterceptor('profilePic', multerOptions()), UserFileUploadInterceptor())
  updateProfile( @User() user: TUser, @Body() updateUserDto: UpdateUserDto) {
    
    return this.publicService.updateProfile( user ,updateUserDto);
  }

  @Delete('profile')
  @Auth( ROLES.User, ROLES.Seller, ROLES.Admin)  
  removeProfile(@User() user: TUser) {
    return this.publicService.removeProfile(user);
  }

  @Delete('profile/freeze')
  @Auth( ROLES.User, ROLES.Seller, ROLES.Admin)
  freezeProfile(@User() user: TUser) {
    return this.publicService.freezeProfile(user);
  }

  @Patch('profile/enable-step-2fa')
  @Auth( ROLES.User, ROLES.Seller, ROLES.Admin)
  @HttpCode(200)
  async enableStep2fa(@User() user: TUser) {
    return await this.publicService.enableStep2fa(user);
  }

@Post('send-mail')
@Auth( ROLES.User, ROLES.Seller, ROLES.Admin)
@HttpCode(200)
async sendMail(@User() user: TUser, @Body() body: SendMailDto) {
  return await this.publicService.sendMail(user, body);
}

@Get('mails')
@Auth( ROLES.User, ROLES.Seller, ROLES.Admin)
async getMails(@User() user: TUser) {
  return await this.publicService.getMails(user);
}

@Delete('delete-mail/:id')
@Auth( ROLES.User, ROLES.Seller, ROLES.Admin)
async deleteMail(@User() user: TUser, @Param('id') id: string) {
  return await this.publicService.deleteMail(user, id);
  
}

@Get('mail-by/:id')
@Auth(ROLES.User, ROLES.Seller, ROLES.Admin)
async mailById(@User() user: TUser, @Param('id') id: string) {
  return await this.publicService.mailById(user, id);
}
  
}

