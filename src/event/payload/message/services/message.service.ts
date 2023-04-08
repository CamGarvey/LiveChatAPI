import { Injectable } from '@nestjs/common';
import { Event, Message, Prisma } from '@prisma/client';
import { SubscriptionTriggers } from 'src/common/subscriptions/subscription-triggers.enum';
import { SubscriptionPayload } from 'src/common/subscriptions/subscription-payload.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pubsub: PubSubService,
  ) {}

  getMessage(eventId: number): Prisma.Prisma__MessageClient<Message> {
    return this.prisma.message.findUniqueOrThrow({
      where: {
        eventId,
      },
    });
  }

  async createMessage(
    chatId: number,
    content: string,
    createdById: number,
  ): Promise<Message> {
    const event = await this.prisma.event.create({
      data: {
        type: 'MESSAGE',
        chatId,
        createdById,
        message: {
          create: {
            content,
          },
        },
      },
      include: {
        message: true,
        chat: {
          select: {
            members: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    this.pubsub.publish<SubscriptionPayload<Event>>(
      SubscriptionTriggers.EventCreated,
      {
        recipients: event.chat.members
          .map((x) => x.id)
          .filter((x) => x !== createdById),
        content: event,
      },
    );

    return event.message;
  }

  async updateMessage(
    eventId: number,
    content: string,
    updatedById: number,
  ): Promise<Message> {
    const message = await this.prisma.message.update({
      data: {
        content,
      },
      include: {
        event: {
          include: {
            chat: {
              select: {
                members: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        eventId,
      },
    });

    this.pubsub.publish<SubscriptionPayload<Event>>(
      SubscriptionTriggers.EventUpdated,
      {
        recipients: message.event.chat.members
          .map((x) => x.id)
          .filter((x) => x !== updatedById),
        content: message.event,
      },
    );

    return message;
  }
}
