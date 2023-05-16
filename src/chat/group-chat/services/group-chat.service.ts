import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Alert, Chat, ChatUpdate, Event, Role } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ChatService } from 'src/chat/chat.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { ICreateGroupChat } from '../models/interfaces/create-group-chat.interface';

@Injectable()
export class GroupChatService extends ChatService {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly pubsub: PubSubService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    protected readonly logger: LoggerService,
  ) {
    super(prisma, pubsub, logger);
  }

  async createGroupChat(
    data: ICreateGroupChat,
    createdById: number,
  ): Promise<Chat> {
    this.logger.debug('Creating group chat', { createdById, ...data });

    const { name, description, userIds } = data;
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

    // Publish chat to members
    await Promise.all(
      recipients.map((id) =>
        this.pubsub.publish<Chat>(`user-chats/${id}`, chat),
      ),
    );

    // Publish alert to all member
    await Promise.all(
      recipients.map((id) =>
        this.pubsub.publish<Alert>(`user-alerts/${id}`, alert),
      ),
    );

    return chat;
  }

  async updateName(
    chatId: number,
    name: string,
    updatedById: number,
  ): Promise<ChatUpdate> {
    this.logger.debug('Updating group chat name', {
      chatId,
      name,
      updatedById,
    });
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
            type: 'NAME_CHANGED',
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

    // Publish chat to members
    await Promise.all(
      recipients.map((id) =>
        this.pubsub.publish<Chat>(`user-chats/${id}`, chatAfterUpdate),
      ),
    );

    await this.pubsub.publish<Event>(`chat-events/${chatId}`, event);

    return event.chatUpdate;
  }

  async updateDescription(
    chatId: number,
    description: string,
    updatedById: number,
  ): Promise<ChatUpdate> {
    this.logger.debug('Updating group chat description', {
      chatId,
      description,
      updatedById,
    });
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
            type: 'DESCRIPTION_CHANGED',
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

    // Publish chat to members
    await Promise.all(
      recipients.map((id) =>
        this.pubsub.publish<Chat>(`user-chats/${id}`, chatAfterUpdate),
      ),
    );

    await this.pubsub.publish<Event>(`chat-events/${chatId}`, event);

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
          // "Unremoving" members that have been removed
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

    // Publish chat to all affected members
    await Promise.all(
      userIds.map((id) => this.pubsub.publish<Chat>(`user-chats/${id}`, chat)),
    );

    // Publish an alert to all affected members
    await Promise.all(
      userIds.map((id) =>
        this.pubsub.publish<Alert>(`user-alerts/${id}`, alert),
      ),
    );

    await this.pubsub.publish<Event>(`chat-events/${chatId}`, event);

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

    // Publish chat to all affected members
    await Promise.all(
      userIds.map((id) => this.pubsub.publish<Chat>(`user-chats/${id}`, chat)),
    );

    // Publish an alert to all affected members
    await Promise.all(
      userIds.map((id) =>
        this.pubsub.publish<Alert>(`user-alerts/${id}`, alert),
      ),
    );

    await this.pubsub.publish<Event>(`chat-events/${chatId}`, event);

    return event.chatUpdate;
  }

  async changeMemberRoles(
    chatId: number,
    userIds: number[],
    role: Role,
    changedById: number,
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

    // Publish an alert to all affected members
    await Promise.all(
      [...userIdSet].map((id) =>
        this.pubsub.publish<Alert>(`user-alerts/${id}`, alert),
      ),
    );

    await this.pubsub.publish<Event>(`chat-events/${chatId}`, event);

    return event.chatUpdate;
  }
}
