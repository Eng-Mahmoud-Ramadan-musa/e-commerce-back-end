import { Controller, Get, Post, Body, Delete, Param, Patch } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddProductDto, UpdateQuantityDto } from './dto';
import { Auth, IdDto, ROLES, User } from 'src/Common';
import { TUser } from 'src/DB';

@Controller('user/cart')
@Auth(ROLES.User)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@User() user: TUser) {
    return this.cartService.getCart(user);
  }

  @Post()
  addProductToCart(@User() user: TUser, @Body() addProductDto: AddProductDto) {
    return this.cartService.addToCart(user, addProductDto);
  }

  @Patch()
  updateQuantity(@User() user: TUser,@Body() updateQuantity: UpdateQuantityDto) {
    return this.cartService.updateQuantity(user , updateQuantity);
  }

  @Delete('/:id')
  removeFromCart(@Param('id') id: string, @User() user: TUser) {
    return this.cartService.removeFromCart(id, user);
  }
  
  @Delete()
  clearCart(@User() user: TUser) {
    return this.cartService.clearCart(user);
  }

}


