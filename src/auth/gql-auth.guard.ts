import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly jwtService: JwtService) {
    super();
  }
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context).getContext();

    if (ctx.req.connectionParams) {
      const headers = ctx.req.connectionParams || {};
      headers['authorization'] = headers.Authorization;
      delete headers.Authorization;
      return { headers };
    }

    return ctx.req;
  }

  canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);

    const { req } = ctx.getContext();

    // add user object to context if user is authenticated
    if (req.user) {
      console.log('test');

      ctx.getContext().user = req.user;
    }

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
