import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): IAuthUser => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
