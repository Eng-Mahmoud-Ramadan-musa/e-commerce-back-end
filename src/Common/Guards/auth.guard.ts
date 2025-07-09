import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { TokenService } from '../Services/token.service';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctxType = context.getType<'http' | 'graphql' | 'ws'>();

    let request: any;
    switch (ctxType) {
      case 'http':
        request = context.switchToHttp().getRequest()
        break;
      case 'graphql':
        request = GqlExecutionContext.create(context).getContext().req
        break;
      case 'ws':
        const client = context.switchToWs().getClient().handshake;
        request = client
        
        break;
      default:
        throw new BadRequestException('Unknown request type');
    }
    const { authorization } = request.headers;

    if (!authorization) {
      throw new BadRequestException('No authorization provided');
    }
    const user = await this.tokenService.verifyTokenAuth(authorization);

    request.user = user;

    return true;
  }
}
