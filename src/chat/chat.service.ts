import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Alert, Chat, Prisma } from '@prisma/client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SubscriptionPayload } from 'src/common/subscriptions/subscription-payload.model';
import { SubscriptionTriggers } from 'src/common/subscriptions/subscription-triggers.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';

@Injectable()
export class ChatService {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly pubsub: PubSubService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    protected readonly logger: LoggerService,
  ) {}

  getChat(chatId: number): Prisma.Prisma__ChatClient<Chat> {
    this.logger.debug('Getting chat', { chatId });
    return this.prisma.chat.findUniqueOrThrow({
      where: {
        id: chatId,
      },
    });
  }

  async deleteChat(chatId: number, deletedById: number) {
    this.logger.debug('Deleting chat', { chatId, deletedById });

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

    const recipients = chat.members.map((x) => x.userId);

    const publish: Promise<void>[] = [
      this.pubsub.publish<SubscriptionPayload<Alert>>(
        SubscriptionTriggers.ChatDeletedAlert,
        {
          recipients,
          content: alert,
        },
      ),
      this.pubsub.publish<SubscriptionPayload<Chat>>(
        SubscriptionTriggers.ChatAccessRevoked,
        {
          recipients,
          content: chat,
        },
      ),
    ];

    await Promise.all(publish);

    return chat;
  }
}
