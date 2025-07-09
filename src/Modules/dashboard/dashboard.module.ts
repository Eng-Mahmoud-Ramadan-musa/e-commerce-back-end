import { Module, forwardRef } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import {
  CategoryModel,
  ProductModel,
  OrderModel,
  CategoryRepository,
  ProductRepository,
  OrderRepository,
} from 'src/DB';
import { GlobalAuthModule } from 'src/Common/modules/globalAuth.module';
import { CloudModule } from 'src/Common/modules/cloud.module';
import { DashboardResolver } from './dashboard.resolver';
import { RealTimeGateway } from '../gateway/gateway';

@Module({
  imports: [
    CategoryModel,
    ProductModel,
    OrderModel,
    forwardRef(() => GlobalAuthModule),
    CloudModule
  ],
  controllers: [DashboardController],
  providers: [
    DashboardResolver,
    DashboardService,
    CategoryRepository,
    ProductRepository,
    OrderRepository,
    RealTimeGateway
  ],
})
export class DashboardModule {}
