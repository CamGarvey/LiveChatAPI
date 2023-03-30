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

  async createGroupChat(
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

    await this.pubsub.publish<NotificationPayload>(
      SubscriptionTriggers.ChatMemberAccessGrantedAlert,
      {
        recipients,
        content: alert,
      },
    );

    return chat;
  }

  async createDirectMessageChat(userId: number, createdById: number) {
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        type: 'DIRECT_MESSAGE',
        members: {
          every: {
            userId: {
              in: [userId, createdById],
            },
          },
        },
      },
    });

    if (existingChat !== null) {
      // No need to create one
      return existingChat;
    }

    // Create new direct message chat
    const chat = await this.prisma.chat.create({
      data: {
        type: 'DIRECT_MESSAGE',
        name: `${createdById}.${userId}`,
        createdById,
        members: {
          createMany: {
            // Creating members
            // Both users have ADMIN roles
            data: [createdById, userId].map((id) => ({
              userId: id,
              role: 'ADMIN',
              addedById: createdById,
            })),
          },
        },
      },
    });

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
          connect: {
            id: userId,
          },
        },
        createdBy: {
          connect: {
            id: createdById,
          },
        },
      },
    });

    await this.pubsub.publish<NotificationPayload>(
      SubscriptionTriggers.ChatMemberAccessGrantedAlert,
      {
        recipients: [userId],
        content: alert,
      },
    );

    return chat;
  }

  async updateGroupChatName(
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
    await this.pubsub.publish<EventPayload>(SubscriptionTriggers.EventCreated, {
      recipients,
      content: event,
    });

    return event.chatUpdate;
  }

  async updateGroupChatDescription(
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
    await this.pubsub.publish<EventPayload>(SubscriptionTriggers.EventCreated, {
      recipients,
      content: event,
    });

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

  async deleteChat(chatId: number, deletedById: number) {
    const chat = await this.prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        deletedAt: new Date().toISOString(),
      },
      // Including member ids for pubsub
      include: {
        members: {
          select: {
            userId: true,
          },
        },
      },
    });

    const alert = await this.prisma.alert.create({
      data: {
        type: 'CHAT_DELETED',
        chat: {
          connect: {
            id: chat.id,
          },
        },
        createdBy: {
          connect: {
            id: deletedById,
          },
        },
      },
    });

    // Publish the deleted chat alert to every member
    // except from the user who deleted it (deletedById)
    await this.pubsub.publish<NotificationPayload>(
      SubscriptionTriggers.ChatDeletedAlert,
      {
        recipients: chat.members
          .map((x) => x.userId)
          .filter((x) => x !== deletedById),
        content: alert,
      },
    );

    return chat;
  }
}
