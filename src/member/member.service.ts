import {
  Connection,
  findManyCursorConnection,
} from '@devoxa/prisma-relay-cursor-connection';
import { Injectable } from '@nestjs/common';
import { ChatUpdate, Member, Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { PaginationArgs } from 'src/common/models/pagination';
import { SubscriptionTriggers } from 'src/common/subscriptions/subscription-triggers.enum';
import {
  EventPayload,
  NotificationPayload,
} from 'src/common/subscriptions/subscription.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { ChangeRoleInput } from './models/inputs/change-role.input';

@Injectable()
export class MemberService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pubsub: PubSubService,
  ) {}

  getMember(memberId: number): Prisma.Prisma__MemberClient<Member> {
    return this.prisma.member.findUniqueOrThrow({
      where: {
        id: memberId,
      },
    });
  }

  async getMembers(
    chatId: number,
    paginationArgs: PaginationArgs,
  ): Promise<Connection<Member>> {
    return await findManyCursorConnection<
      Member,
      Pick<Prisma.MemberWhereUniqueInput, 'id'>
    >(
      (args) =>
        this.prisma.chat
          .findUniqueOrThrow({
            ...{ where: { id: chatId || undefined } },
          })
          .members({
            ...args,
          }),
      () =>
        this.prisma.chat
          .findUniqueOrThrow({
            ...{ where: { id: chatId || undefined } },
            select: {
              _count: {
                select: {
                  members: true,
                },
              },
            },
          })
          .then((x) => x._count.members),
      paginationArgs,
      {
        getCursor: (record) => ({ id: record.id }),
        encodeCursor: (cursor) =>
          Buffer.from(JSON.stringify(cursor)).toString('base64'),
        decodeCursor: (cursor) =>
          JSON.parse(Buffer.from(cursor, 'base64').toString('ascii')),
      },
    );
  }

  async changeMemberRoles(
    { chatId, userIds, role }: ChangeRoleInput,
    changedById,
  ): Promise<ChatUpdate> {
    // Remove duplicates
    const userIdSet: Set<number> = new Set(userIds);
    userIdSet.delete(changedById);

    if (userIdSet.size === 0) {
      throw new GraphQLError('Member list must not be empty');
    }

    const chat = await this.prisma.chat.update({
      data: {
        members: {
          updateMany: {
            data: {
              role,
            },
            where: {
              userId: {
                in: [...userIdSet],
              },
            },
          },
        },
      },
      select: {
        members: {
          select: {
            userId: true,
          },
        },
      },
      where: {
        id: chatId,
      },
    });

    // Create new chat event
    const event = await this.prisma.event.create({
      data: {
        type: 'CHAT_UPDATE',
        chat: {
          connect: {
            id: chatId,
          },
        },
        createdBy: {
          connect: {
            id: changedById,
          },
        },
        chatUpdate: {
          create: {
            type: 'ROLE_CHANGED',
            newRole: role,
            members: userIdSet
              ? {
                  connect: [...userIdSet].map((userId) => ({
                    userId_chatId: {
                      chatId,
                      userId,
                    },
                  })),
                }
              : undefined,
          },
        },
      },
      include: {
        chatUpdate: true,
      },
    });

    const recipients = chat.members
      .map((x) => x.userId)
      .filter((x) => x !== changedById);

    // Publish new chat event
    await this.pubsub.publish<EventPayload>(SubscriptionTriggers.EventCreated, {
      recipients,
      content: event,
    });

    // Create new alert for those affected
    const alert = await this.prisma.alert.create({
      data: {
        type: 'CHAT_ROLE_CHANGED',
        chat: {
          connect: {
            id: chatId,
          },
        },
        createdBy: {
          connect: {
            id: changedById,
          },
        },
        recipients: userIdSet
          ? {
              connect: [...userIdSet].map((id) => ({ id })),
            }
          : undefined,
      },
    });

    // Publish new chat alert
    await this.pubsub.publish<NotificationPayload>(
      SubscriptionTriggers.ChatAdminAccessRevokedAlert,
      {
        recipients,
        content: alert,
      },
    );

    return event.chatUpdate;
  }
}
