import { ContextType, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { HashService } from 'src/hash/hash.service';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    if (context.getType<ContextType | 'graphql'>() === 'graphql') {
      const ctx = GqlExecutionContext.create(context).getContext();

      if (ctx.req.connectionParams) {
        const headers = ctx.req.connectionParams || {};

        headers['authorization'] = headers.Authorization;
        delete headers.Authorization;

        return { headers };
      }

      return ctx.req;
    }
    return context.switchToHttp().getRequest();
  }
}
