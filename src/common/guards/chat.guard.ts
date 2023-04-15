import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common/exceptions/forbidden.exception';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { HashService } from 'src/hash/hash.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();

    const encodeChatId = ctx.req.body.variables.chatId;

    if (!encodeChatId || !this.hashService.isValidId(encodeChatId)) {
      throw new ForbiddenException('Invalid ID');
    }

    const chatId = +this.hashService.decode(encodeChatId);

    const user: IAuthUser = ctx.req.user;

    if (!user.chatIds.has(chatId)) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }

    const roles = this.reflector.get<Role[]>('roles', context.getHandler());

    if (!roles) {
      // If not roles are specified then canActivate
      return true;
    }

    const member = await this.prisma.member.findUniqueOrThrow({
      select: {
        role: true,
      },
      where: {
        userId_chatId: {
          chatId,
          userId: user.id,
        },
      },
    });

    return roles.includes(member.role);
  }
}
