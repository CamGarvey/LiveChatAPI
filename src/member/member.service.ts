import {
  Connection,
  findManyCursorConnection,
} from '@devoxa/prisma-relay-cursor-connection';
import { Injectable } from '@nestjs/common';
import { ChatUpdate, Member, Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { PaginationArgs } from 'src/common/pagination';
import { SubscriptionTriggers } from 'src/common/subscriptions/subscription-triggers.enum';
import {
  EventPayload,
  NotificationPayload,
} from 'src/common/subscriptions/subscription.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { MemberAlterationInput } from '../chat/models/interfaces/member-alteration.input';
import { ChangeRoleInput } from './models/inputs/change-role.input';

@Injectable()
export class MemberService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pubsub: PubSubService,
  ) {}

  getMembers(
    chatId: number,
    args: PaginationArgs,
  ): Promise<Connection<Member>> {
    return findManyCursorConnection<
      Member,
      Pick<Prisma.MemberWhereInput, 'id'>
    >(
      (args) => this.prisma.member.findMany({ where: { chatId, ...args } }),
      () => this.prisma.member.count({ where: { chatId, ...args } }),
      args,
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
    currentUserId: number,
    { chatId, userIds, role }: ChangeRoleInput,
  ): Promise<ChatUpdate> {
    // Remove duplicates
    const userIdSet: Set<number> = new Set(userIds);
    userIdSet.delete(currentUserId);

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
            id: currentUserId,
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
      .filter((x) => x !== currentUserId);

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
            id: currentUserId,
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
