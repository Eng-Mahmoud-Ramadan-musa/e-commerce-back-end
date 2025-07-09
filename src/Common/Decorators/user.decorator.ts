import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

export const User = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const ctxType = context.getType<'http' | 'graphql' | 'ws'>();

    let request: Request;

    switch (ctxType) {
      case 'http':
        request = context.switchToHttp().getRequest<Request>();
        break;
      case 'graphql':
        request = GqlExecutionContext.create(context).getContext().req;
        break;
      case 'ws':
        request = context.switchToWs().getClient().handshake;
        break;
      default:
        throw new BadRequestException('Unknown request type');
    }

    const user = request['user'];
    return data ? user?.[data] : user;
  },
);
