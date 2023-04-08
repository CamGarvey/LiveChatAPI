import { Injectable } from '@nestjs/common';
import { SubscriptionTriggers } from 'src/common/subscriptions/subscription-triggers.enum';
import { SubscriptionPayload } from 'src/common/subscriptions/subscription-payload.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { Alert } from '@prisma/client';

@Injectable()
export class DirectMessageChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pubsub: PubSubService,
  ) {}

  async create(userId: number, createdById: number) {
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

    await this.pubsub.publish<SubscriptionPayload<Alert>>(
      SubscriptionTriggers.ChatMemberAccessGrantedAlert,
      {
        recipients: [userId],
        content: alert,
      },
    );

    return chat;
  }
}
