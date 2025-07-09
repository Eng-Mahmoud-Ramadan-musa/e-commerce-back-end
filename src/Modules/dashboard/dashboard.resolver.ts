import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { DashboardService } from './dashboard.service';
import { ICategory, IOrderDto, IProduct, IUserDto } from './entities/dashboard.entity';
import { IdInput, UpdateStatusOrderInput, UpdateUserRoleInput } from './dto';
import { Auth, ROLES, User } from 'src/Common';
import { TUser } from 'src/DB';

@Resolver()
@Auth(ROLES.Admin)
export class DashboardResolver {
  constructor(private readonly dashboardService: DashboardService) {}

  @Query(() => [IUserDto], { name: 'allAdmins' })
  async allAdmins() {
    return await this.dashboardService.admins();
  }

  @Query(() => [IUserDto], { name: 'allSellers' })
  async allSellers() {
    return await this.dashboardService.sellers();
  }

  @Query(() => [IUserDto], { name: 'allUsers' })
  async allUsers() {
    return await this.dashboardService.users();
  }

  @Query(() => [IProduct], { name: 'allProducts' })
  async allProducts() {
    return await this.dashboardService.products();
  }

  @Query(() => [ICategory], { name: 'allCategories' })
  async allCategory() {
    return await this.dashboardService.categories();
  }

  @Query(() => [IOrderDto], { name: 'allOrders'})
  async allOrders() {
    return await this.dashboardService.orders();
  }

  @Mutation(() => String)
  async deleteCategory(@Args('deleteCategory') input: IdInput) {
    return this.dashboardService.deleteCategory(input);
  }

  @Mutation(() => String)
  async deleteProduct(@Args('deleteProduct') input: IdInput) {
    return this.dashboardService.deleteProduct(input);
  }

  @Mutation(() => String)
  async deleteUser(@Args('deleteUser') input: IdInput) {
    return this.dashboardService.deleteUser(input);
  }

  @Mutation(() => [IUserDto])
  async updateUserRole(@Args('updateUserRole') input: UpdateUserRoleInput) {
    return this.dashboardService.updateUserRole(input);
  }

  @Mutation(() => String)
  async updateOrderStatus(@User() user:TUser, @Args('updateOrderStatus') input: UpdateStatusOrderInput) {
    return this.dashboardService.updateOrderStatus(user, input);
  }

}
