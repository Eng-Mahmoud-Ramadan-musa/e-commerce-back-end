import { Body, Controller, Param, Post, Put, Req, UseInterceptors } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AddCategoryInput, EditCategoryInput } from './dto';
import { Auth, CategoryFileUpdateInterceptor, IdDto, multerOptions, ROLES, User } from 'src/Common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { TUser } from 'src/DB';

@Controller('dashboard')
@Auth(ROLES.Admin)
export class DashboardController {
    constructor(
      private readonly dashboardService: DashboardService) {}

    @Post('category')
    @UseInterceptors(FileInterceptor('image', multerOptions()), CategoryFileUpdateInterceptor('categories'))
    async createCategory(@User() user: TUser, @Body() createCategoryInput: AddCategoryInput) {
        return this.dashboardService.addCategory(user, createCategoryInput);
    }

    @Put('category/:id')
    @UseInterceptors(
      FileInterceptor('image', multerOptions()),
      CategoryFileUpdateInterceptor())
    async updateCategory(
      @User() user: TUser,
      @Param('id') id: string,
      @Body() editCategoryInput: EditCategoryInput
    ) {
      return this.dashboardService.updateCategory(user,id, editCategoryInput)
    }
    
}
