import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): IAuthUser => {
    switch (context.getType<GqlContextType>()) {
      case 'graphql':
        return GqlExecutionContext.create(context).getContext().user;
      case 'http':
        return context.switchToHttp().getRequest().user;
      default:
        throw new Error('Unsupported context type');
    }
  },
);
