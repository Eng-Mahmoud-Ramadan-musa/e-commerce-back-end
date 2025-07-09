import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Roles } from "../Decorators/role.decorator";
import { GqlExecutionContext } from "@nestjs/graphql";
import { TUser } from "src/DB";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndMerge(Roles, [context.getClass(), context.getHandler()]);
         const ctxType = context.getType<'http' | 'graphql' | 'ws'>();
        
            let user: TUser;
            switch (ctxType) {
              case 'http':
                user = context.switchToHttp().getRequest().user
                break;
              case 'graphql':
                user = GqlExecutionContext.create(context).getContext().req.user
                break;
              case 'ws':
                user = context.switchToWs().getClient().handshake.user;
                
                break;
              default:
                throw new UnauthorizedException('role not authorized');
            }
    if(!user || !roles.includes(user.role)) return false
    return true;
  }
}