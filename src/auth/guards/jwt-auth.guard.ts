import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

type Request = {
  headers: {
    authorization: string;
  };
};

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext): Request {
    switch (context.getType<GqlContextType>()) {
      case 'graphql':
        return this.getGraphqlRequest(context);
      case 'http':
        return context.switchToHttp().getRequest();
      default:
        throw new Error('Unsupported context');
    }
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

    if (context.getType<GqlContextType>() === 'graphql') {
      // Put user on gql context
      const gqlContext = GqlExecutionContext.create(context);
      gqlContext.getContext().user = user;
    }

    return user;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'public',
      context.getHandler(),
    );

    return isPublic ? true : super.canActivate(context);
  }

  private getGraphqlRequest(context: ExecutionContext): Request {
    const ctx = GqlExecutionContext.create(context).getContext();

    // check if websocket
    if (ctx.req.connectionParams) {
      const headers = ctx.req.connectionParams || {};
      headers.authorization = headers.Authorization;
      return { headers };
    }

    return ctx.req;
  }
}
