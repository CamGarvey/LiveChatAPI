import { Injectable } from '@nestjs/common';
import { Alert, Chat, Prisma } from '@prisma/client';
import { SubscriptionPayload } from 'src/common/subscriptions/subscription-payload.model';
import { SubscriptionTriggers } from 'src/common/subscriptions/subscription-triggers.enum';
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
    await this.pubsub.publish<SubscriptionPayload<Alert>>(
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
