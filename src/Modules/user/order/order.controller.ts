import { Controller, Get, Post, Body, Param, Req, Patch } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto';
import { Auth, IdDto, ROLES, User } from 'src/Common';
import { TUser } from 'src/DB';
import { Request } from 'express';

@Controller('user/order')
// @Auth(ROLES.User)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

@Auth(ROLES.User)
  @Post()
  create(@User() user: TUser, @Body() body: CreateOrderDto) {
    return this.orderService.create(user,body);
  }

@Auth(ROLES.User, ROLES.Admin,  ROLES.Seller)
  @Get('/:id')
  getOrderById(@User() user: TUser,@Param('id') id: string) {
    return this.orderService.getOrderById(user, id);
  }

@Auth(ROLES.User)
  @Get()
  findAll(@User() user: TUser) {
    return this.orderService.findAll(user);
  }

@Post('webhook')
    webhook(@Req() req: Request) {
      return this.orderService.webhook(req);
    }

@Auth(ROLES.User)
  @Post('/:id')
    checkout(@User() user: TUser, @Param() params: IdDto) {
      return this.orderService.checkout(user,params);
  } 

  @Auth(ROLES.User, ROLES.Admin, ROLES.Seller)
  @Patch(':id/cancel')
  cancelOrder(@User() user: TUser, @Param('id') orderId: string) {
    return this.orderService.cancelOrder(user,orderId);
  }


}
