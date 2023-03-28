import { CanActivate, Injectable, ExecutionContext } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common/exceptions/forbidden.exception';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from '@prisma/client';
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
    const chatId = +this.hashService.decode(ctx.req.body.variables.chatId);
    const userId = ctx.req.user.id;

    const chat = await this.prisma.chat.findUniqueOrThrow({
      where: { id: chatId },
      include: { members: true },
    });

    const member = chat.members.find((m) => m.userId === userId);

    if (!member) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }

    const roles = this.reflector.get<Role[]>('roles', context.getHandler());

    if (!roles) {
      // If not roles are specified then canActivate
      return true;
    }

    return roles.includes(member.role);
  }
}
