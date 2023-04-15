import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common/exceptions/forbidden.exception';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { HashService } from 'src/hash/hash.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();

    const encodedEventId = ctx.req.body.variables.eventId;

    if (!encodedEventId || !this.hashService.isValidId(encodedEventId)) {
      throw new ForbiddenException('Invalid ID');
    }

    const eventId = +this.hashService.decode(encodedEventId);
    const userId = ctx.req.user.id;

    const event = await this.prisma.event.findUniqueOrThrow({
      where: { id: eventId },
      include: {
        chat: {
          include: {
            members: true,
          },
        },
      },
    });

    const member = event.chat.members.find((m) => m.userId === userId);

    if (!member) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }

    const roles = this.reflector.get<Role[]>('roles', context.getHandler());

    if (!roles || event.createdById == userId) {
      // If not roles are specified or the user is the creator of the event then canActivate
      return true;
    }

    return roles.includes(member.role);
  }
}
