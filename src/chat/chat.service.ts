import { Injectable } from '@nestjs/common';
import { Chat, ChatUpdate, Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { SubscriptionTriggers } from 'src/common/subscriptions/subscription-triggers.enum';
import {
  EventPayload,
  NotificationPayload,
} from 'src/common/subscriptions/subscription.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pubsub: PubSubService,
  ) {}

  getChat(chatId: number): Prisma.Prisma__ChatClient<Chat> {
    return this.prisma.chat.findUniqueOrThrow({
      where: {
        id: chatId,
      },
    });
  }

  async addMembers(
    chatId: number,
    userIds: number[],
    addedById: number,
  ): Promise<ChatUpdate> {
    // Remove duplicates & creator as members
    const userIdSet: Set<number> = new Set(userIds);
    userIdSet.delete(addedById);

    if (userIds.length === 0)
      throw new GraphQLError('Member list must not be empty');

    const chat = await this.prisma.chat.update({
      data: {
        members: {
          // Create new members
          createMany: {
            data: [...userIdSet].map((id) => ({
              userId: id,
              role: 'BASIC',
              addedById,
            })),
            // Skipping duplicates as they will be updated below
            skipDuplicates: true,
          },
          // "Undeleting" members that have been deleted
          updateMany: {
            data: {
              removedAt: null,
              removedById: null,
              role: 'BASIC',
            },
            where: {
              userId: {
                in: [...userIdSet],
              },
            },
          },
        },
      },
      include: {
        members: {
          select: {
            id: true,
          },
        },
      },
      where: {
        id: chatId,
      },
    });

    // Creating a Members Added event
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
            id: addedById,
          },
        },
        chatUpdate: {
          create: {
            type: 'MEMBERS_ADDED',
            members: [...userIdSet]
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
      .map((x) => x.id)
      .filter((x) => x !== addedById);

    // Publish new chat event
    await this.pubsub.publish<EventPayload>(SubscriptionTriggers.EventCreated, {
      recipients,
      content: event,
    });

    const alert = await this.prisma.alert.create({
      data: {
        type: 'CHAT_ACCESS_GRANTED',
        chat: {
          connect: {
            id: chatId,
          },
        },
        createdBy: {
          connect: {
            id: addedById,
          },
        },
        recipients: [...userIdSet]
          ? {
              connect: [...userIdSet].map((id) => ({ id })),
            }
          : undefined,
      },
    });

    // Publish new chat alert
    await this.pubsub.publish<NotificationPayload>(
      SubscriptionTriggers.ChatMemberAccessGrantedAlert,
      {
        recipients,
        content: alert,
      },
    );

    return event.chatUpdate;
  }

  async removeMembers(
    chatId: number,
    userIds: number[],
    removedById: number,
  ): Promise<ChatUpdate> {
    const chat = await this.prisma.chat.update({
      data: {
        members: {
          updateMany: {
            data: {
              removedAt: new Date().toISOString(),
              removedById,
            },
            where: {
              userId: {
                in: userIds,
              },
            },
          },
        },
      },
      include: {
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
            id: removedById,
          },
        },
        chatUpdate: {
          create: {
            type: 'MEMBERS_REMOVED',
            members: userIds
              ? {
                  connect: userIds.map((userId) => ({
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

    // Publish new chat event
    await this.pubsub.publish<EventPayload>(SubscriptionTriggers.EventCreated, {
      recipients: chat.members
        .map((x) => x.userId)
        .filter((x) => x !== removedById),
      content: event,
    });

    const alert = await this.prisma.alert.create({
      data: {
        type: 'CHAT_ACCESS_REVOKED',
        chat: {
          connect: {
            id: chatId,
          },
        },
        createdBy: {
          connect: {
            id: removedById,
          },
        },
        recipients: userIds
          ? {
              connect: userIds.map((id) => ({ id })),
            }
          : undefined,
      },
    });

    // Publish new chat alert
    await this.pubsub.publish<NotificationPayload>(
      SubscriptionTriggers.ChatMemberAccessRevokedAlert,
      {
        recipients: userIds,
        content: alert,
      },
    );

    return event.chatUpdate;
  }
}
