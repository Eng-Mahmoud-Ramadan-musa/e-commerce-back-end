import { Module } from '@nestjs/common';
import { RealTimeGateway } from './gateway';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from 'src/Common/Services/token.service';
import { UserModel, UserRepository } from 'src/DB';

@Module({
  imports: [JwtModule.register({}), UserModel],
  providers: [RealTimeGateway, TokenService, UserRepository],
  exports: [TokenService, UserRepository, UserModel],
})
export class GatewayModule {}
