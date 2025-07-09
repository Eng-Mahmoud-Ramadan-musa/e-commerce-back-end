import { Module, Global } from '@nestjs/common';
import { CloudService } from '../Services';

@Global() // لو حابب تستخدمه في كل مكان بدون import
@Module({
  providers: [CloudService],
  exports: [CloudService],
})
export class CloudModule {}
