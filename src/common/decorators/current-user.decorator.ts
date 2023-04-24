import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): IAuthUser => {
    if (context.getType<GqlContextType>() === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      console.log(ctx.getType());
      return ctx.getContext().req.user;
    }
  },
);
