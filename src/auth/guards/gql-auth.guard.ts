import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context).getContext();

    if (ctx.req.connectionParams) {
      const headers = ctx.req.connectionParams || {};
      headers['authorization'] = headers.Authorization;
      return { headers };
    }

    return ctx.req;
  }

  handleRequest<IAuthUser>(
    err: any,
    user: IAuthUser,
    _: any,
    context: ExecutionContext,
  ) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    // Put user on gql context
    const gqlContext = GqlExecutionContext.create(context);
    gqlContext.getContext().user = user;

    return user;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== ('graphql' as any)) {
      // Activate any non graphql requests
      return true;
    }
    return super.canActivate(context);
  }
}
