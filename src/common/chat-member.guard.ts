import { CanActivate, Injectable, ExecutionContext } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common/exceptions/forbidden.exception';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    const chatId = ctx.req.body.variables.chatId;
    const userId = ctx.req.user.id;

    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { members: true },
    });

    const isMember = chat?.members.some((member) => member.id === userId);

    if (!isMember) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }

    return isMember;
  }
}
