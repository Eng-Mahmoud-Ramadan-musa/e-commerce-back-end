import { Module, forwardRef } from '@nestjs/common';
import { GlobalAuthModule } from 'src/Common/modules/globalAuth.module';
import { UserModel, UserRepository } from 'src/DB';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    forwardRef(() => GlobalAuthModule),
    CartModule,
    OrderModule
  ],
  providers: [],
})
export class UserModule {}
