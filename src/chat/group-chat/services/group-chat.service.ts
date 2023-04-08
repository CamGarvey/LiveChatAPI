import { Injectable } from '@nestjs/common';
import { Alert, Chat, ChatUpdate, Event } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { SubscriptionTriggers } from 'src/common/subscriptions/subscription-triggers.enum';
import { SubscriptionPayload } from 'src/common/subscriptions/subscription-payload.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';

@Injectable()
export class GroupChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pubsub: PubSubService,
  ) {}

  async create(
    name: string,
    description: string,
    userIds: number[],
    createdById: number,
  ): Promise<Chat> {
    // Remove duplicates and add creator
    const userIdSet: Set<number> = new Set(userIds);
    userIdSet.add(createdById);

    // Create the chat
    const chat = await this.prisma.chat.create({
      data: {
        type: 'GROUP',
        name,
        description,
        createdById,
        members: {
          createMany: {
            // Creating members
            // Creator has OWNER role
            // Others have BASIC role
            data: [...userIdSet].map((id) => ({
              userId: id,
              role: id == createdById ? 'OWNER' : 'BASIC',
              addedById: createdById,
            })),
          },
        },
      },
    });

    const recipients = [...userIdSet].filter((id) => id !== createdById);

    // Create an alert for members
    const alert = await this.prisma.alert.create({
      data: {
        type: 'CHAT_ACCESS_GRANTED',
        chat: {
          connect: {
            id: chat.id,
          },
        },
        recipients: {
          connect: recipients.map((id) => ({ id })),
        },
        createdBy: {
          connect: {
            id: createdById,
          },
        },
      },
    });

    await this.pubsub.publish<SubscriptionPayload<Alert>>(
      SubscriptionTriggers.ChatMemberAccessGrantedAlert,
      {
        recipients,
        content: alert,
      },
    );

    return chat;
  }

  async updateName(
    chatId: number,
    name: string,
    updatedById: number,
  ): Promise<ChatUpdate> {
    const chatBeforeUpdate = await this.prisma.chat.findUniqueOrThrow({
      where: {
        id: chatId,
      },
      select: {
        name: true,
        type: true,
      },
    });

    if (chatBeforeUpdate.type !== 'GROUP') {
      throw new GraphQLError('Invalid chat');
    }

    if (name === chatBeforeUpdate.name) {
      throw new GraphQLError('Name has not changed');
    }

    const chatAfterUpdate = await this.prisma.chat.update({
      data: {
        name,
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
            id: updatedById,
          },
        },
        chatUpdate: {
          create: {
            type: 'NAME_UPDATED',
            nameBefore: chatBeforeUpdate.name,
            nameAfter: chatAfterUpdate.name,
          },
        },
      },
      include: {
        chatUpdate: true,
      },
    });

    const recipients = chatAfterUpdate.members
      .map((x) => x.userId)
      .filter((x) => x !== updatedById);

    // Publish new chat event
    await this.pubsub.publish<SubscriptionPayload<Event>>(
      SubscriptionTriggers.EventCreated,
      {
        recipients,
        content: event,
      },
    );

    return event.chatUpdate;
  }

  async updateDescription(
    chatId: number,
    description: string,
    updatedById: number,
  ): Promise<ChatUpdate> {
    const chatBeforeUpdate = await this.prisma.chat.findUniqueOrThrow({
      where: {
        id: chatId,
      },
      select: {
        description: true,
        type: true,
      },
    });

    if (chatBeforeUpdate.type !== 'GROUP') {
      throw new GraphQLError('Invalid chat');
    }

    if (description === chatBeforeUpdate.description) {
      throw new GraphQLError('Description has not changed');
    }

    const chatAfterUpdate = await this.prisma.chat.update({
      data: {
        description,
      },
      select: {
        description: true,
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
            id: updatedById,
          },
        },
        chatUpdate: {
          create: {
            type: 'DESCRIPTION_UPDATED',
            descriptionBefore: chatBeforeUpdate.description,
            descriptionAfter: chatAfterUpdate.description,
          },
        },
      },
      include: {
        chatUpdate: true,
      },
    });

    const recipients = chatAfterUpdate.members
      .map((x) => x.userId)
      .filter((x) => x !== updatedById);

    // Publish new chat event
    await this.pubsub.publish<SubscriptionPayload<Event>>(
      SubscriptionTriggers.EventCreated,
      {
        recipients,
        content: event,
      },
    );

    return event.chatUpdate;
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
    await this.pubsub.publish<SubscriptionPayload<Event>>(
      SubscriptionTriggers.EventCreated,
      {
        recipients,
        content: event,
      },
    );

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
    await this.pubsub.publish<SubscriptionPayload<Alert>>(
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
    await this.pubsub.publish<SubscriptionPayload<Event>>(
      SubscriptionTriggers.EventCreated,
      {
        recipients: chat.members
          .map((x) => x.userId)
          .filter((x) => x !== removedById),
        content: event,
      },
    );

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
    await this.pubsub.publish<SubscriptionPayload<Alert>>(
      SubscriptionTriggers.ChatMemberAccessRevokedAlert,
      {
        recipients: userIds,
        content: alert,
      },
    );

    return event.chatUpdate;
  }
}
