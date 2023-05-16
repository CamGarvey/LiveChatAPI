import { Injectable } from '@nestjs/common';
import { Event, Message, Prisma } from '@prisma/client';
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

    await this.pubsub.publish<Event>(`chat-events/${chatId}`, event);

    return event.message;
  }

  async updateMessage(eventId: number, content: string): Promise<Message> {
    const message = await this.prisma.message.update({
      data: {
        content,
      },
      include: {
        event: true,
      },
      where: {
        eventId,
      },
    });

    await this.pubsub.publish<Event>(
      `chat-events/${message.event.chatId}`,
      message.event,
    );

    return message;
  }
}
