import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CartRepository, ProductRepository, TUser } from 'src/DB';
import { AddProductDto, UpdateQuantityDto } from './dto';
import { ICartItem, IdDto } from 'src/Common';


@Injectable()
export class CartService {
constructor(private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository) {}
    
    async getCart(user: TUser) {
        const userId = user._id;
        const cart = await this.cartRepository.findOne({
            filter: { createdBy: userId },
            populate: [
                {
                    path: 'products.productId',
                    populate: [{ path: 'category', select: 'name' }, 
                    { path: 'createdBy', select: 'userName email phone profilePic' }]
                },
            ],
        });
    
        if (!cart) {
            throw new NotFoundException('Cart not found');
        }
    
        return cart;
    }

    async addToCart(user: TUser, addProductDto: AddProductDto) {    
          addProductDto.quantity = addProductDto.quantity || 1;

          const product = await this.productRepository.findOne({
            filter: {
              _id: addProductDto.productId,
              stock: { $gte: addProductDto.quantity },
            },
          });
      
          if (!product) {
            throw new BadRequestException('Product not found or stock is not enough');
          }
      
          let cart = await this.cartRepository.findOne({ filter: { createdBy: user._id } });
      
          if (!cart) {
            cart = await this.cartRepository.create({
              createdBy: user._id,
              products: [{
                productId: addProductDto.productId,
                quantity: addProductDto.quantity!,
              }],
            });
        
            return {message: 'add product to cart successfully', cart};
    }

  const existingProduct = cart.products.find(
    (item) => item.productId.toString() === addProductDto.productId.toString()
  );

  if (existingProduct) {
    existingProduct.quantity = addProductDto.quantity!;
  } else {
    cart.products.push({
      productId: addProductDto.productId,
      quantity: addProductDto.quantity!,
    });
  }

  await cart.save();
  return {message: 'add product to cart successfully', cart};;
    }

  async updateQuantity(user: TUser, updateQuantity: UpdateQuantityDto) {
    const { productId, quantity } = updateQuantity;
    const cart = await this.cartRepository.findOne({ filter: { createdBy: user._id } });
  
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
  
    const product = cart.products.find((item: ICartItem) => item.productId.toString() === productId.toString());
  
    if (!product) {
      throw new NotFoundException('Product not found in your cart');
    }
  
    product.quantity = quantity;
    await cart.save();
  
    return { message: 'Product quantity updated successfully' };
  }

    async removeFromCart(id: string, user: TUser) {
        const userId = user._id
        if (!userId) throw new UnauthorizedException('User not authenticated');
    
        const cart = await this.cartRepository.findOne({
            filter: { createdBy: userId }
        });

    
        if (!cart) throw new NotFoundException('Cart not found');
    
        const productIndex = cart.products.findIndex(
            (product) => product.productId.toString() === id.toString()
        );
    
        if (productIndex === -1) throw new BadRequestException('Product not found in your cart');
    
        // Remove the product
        cart.products.splice(productIndex, 1);
        await cart.save();
    
        return { message: 'Product deleted successfully' };
    }

    async clearCart(user: TUser) {
        const userId = user._id
        if (!userId) throw new UnauthorizedException('User not authenticated');
    
        const cart = await this.cartRepository.findOne({
            filter: { createdBy: userId }
        });
    
        if (!cart) throw new NotFoundException('Cart not found');
    
        cart.products = [];
        await cart.save();
    
        return { message: 'Cart cleared successfully' };
    }
    
}

