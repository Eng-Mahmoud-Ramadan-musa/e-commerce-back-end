import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { AddCategoryInput, EditCategoryInput, IdInput, UpdateStatusOrderInput, UpdateUserRoleInput } from './dto';
import { CategoryRepository, OrderRepository, ProductRepository, TOrder, TUser, UserRepository } from 'src/DB';
import { ROLES } from 'src/Common';
import slugify from 'slugify';
import { RealTimeGateway } from '../gateway/gateway';

@Injectable()
export class DashboardService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly productRepository: ProductRepository,
    private readonly orderRepository: OrderRepository,
    private readonly realTimeGateway: RealTimeGateway,
    
  ) {}

  async admins() {
    const admins = await this.userRepository.find({filter: {role: ROLES.Admin}});
    return admins;
  }

  async sellers() {
    const sellers = await this.userRepository.find({filter: {role: ROLES.Seller}});
  return sellers;
  }

  async users() {
    const users = await this.userRepository.find({filter: {role: ROLES.User}});
    return users;
  }

  async products() {
    const products = await this.productRepository.find({filter: {}, populate: [{path: 'createdBy', select: "userName email profilePic"}, {path: 'category', select: "name slug image"}]});
return products;
  }

  async categories() {
    const categories = await this.categoryRepository.find({filter: {}, populate: [{path: 'createdBy', select: "userName email profilePic"}]});
    return categories;
  }

  async orders() {
    const orders = await this.orderRepository.find({
      filter: {},
      populate: [
        { path: 'createdBy', select: 'userName email profilePic' },
        { path: 'productItems._id', select: 'title slug images category', populate: [{ path: 'category._id', select: 'name slug image' }, ] },
      ]
      });
    return orders;
  }

async addCategory(user: TUser, addCategoryInput: AddCategoryInput) {
  const { name, image } = addCategoryInput;

  const categoryExist = await this.categoryRepository.findOne({ filter: { name } });
  if (categoryExist) throw new BadRequestException('Category already exists');

  // إنشاء التصنيف أولًا
  const category = await this.categoryRepository.create({
    name,
    image,
    createdBy: user._id,
  });

  // ثم إرسال إشعار WebSocket
  await this.realTimeGateway.sendCategoryMessageCreated(name, user.userName);

  return category;
}


  async updateCategory(user: TUser,id: string,  editCategoryInput: EditCategoryInput) {
    const userId = user?._id;
    
    const updatedCategory = await this.categoryRepository.findByIdAndUpdate(
      new Types.ObjectId(id),
      {
        ...editCategoryInput,
        updatedBy: userId,
        slug: editCategoryInput.name && slugify(editCategoryInput.name as string)
      },
      { new: true }
    );
  
    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  
    return updatedCategory;
  }
  
  async deleteCategory(deleteCategoryInput: IdInput) {
    const { id } = deleteCategoryInput;
    const result = await this.categoryRepository.delete({_id: id});
    const message = result.deletedCount 
    ? "category deleted successfully"
    : "not found category"
    return message 
    
  }

  async deleteProduct(deleteProductInput: IdInput) {
    const { id } = deleteProductInput;
    const result = await this.productRepository.delete({_id: id});
    // await Promise.all([
    //   this.orderRepository.deleteMany({ createdBy: id }),
    //   this.cartRepository.deleteMany({ createdBy: id }),
    // ]);
    const message = result.deletedCount 
    ? "product deleted successfully"
    : "not found product"
    return message 
    
  }

  async deleteUser(deleteUserInput: IdInput) {
    const { id } = deleteUserInput;
    const result = await this.userRepository.delete({_id: id});
    // await Promise.all([
    //   this.orderRepository.deleteMany({ createdBy: id }),
    //   this.cartRepository.deleteMany({ createdBy: id }),
    //   this.productRepository.deleteMany({ createdBy: id }),
    //   this.categoryRepository.deleteMany({ createdBy: id }),
    // ]);
    const message = result.deletedCount 
    ? "user deleted successfully"
    : "not found user"
    return message 
    
  }

  async updateUserRole(updateUserRoleInput: UpdateUserRoleInput) {
    const { id, role } = updateUserRoleInput;
    const result: any = await this.userRepository.findByIdAndUpdate(id, {role});
    
    const message = result
    ? "user role updated successfully"
    : "not found user"
    return message 
    
  }

  async updateOrderStatus(user: TUser, updateStatusOrderInput: UpdateStatusOrderInput) {
    const { id, orderStatus } = updateStatusOrderInput;
    const order: TOrder | {} = this.orderRepository.findByIdAndUpdate(id, {orderStatus});
    this.realTimeGateway.sendOrderMessageToAdmins('updated', id.toString(), user.userName)
    const message = order
    ? "order status updated successfully"
    : "update order status failed"
    return message
    
  }
  

}
