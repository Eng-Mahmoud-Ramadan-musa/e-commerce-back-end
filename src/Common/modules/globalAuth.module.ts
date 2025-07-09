// src/common/modules/token.module.ts
import { Module, Global, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../Guards';
import { TokenService } from '../Services';
import { DashboardModule } from 'src/Modules/dashboard/dashboard.module';
import { UserModel, UserRepository } from 'src/DB';

@Global()
@Module({
  imports: [
    JwtModule.register({}),
    forwardRef(() => DashboardModule),
    UserModel,
  ],
  providers: [TokenService, AuthGuard , UserRepository],
  exports: [TokenService, AuthGuard, UserRepository, UserModel],
})
export class GlobalAuthModule {}