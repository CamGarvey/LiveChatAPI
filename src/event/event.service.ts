import {
  Connection,
  findManyCursorConnection,
} from '@devoxa/prisma-relay-cursor-connection';
import { Injectable } from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { PaginationArgs } from 'src/common/models/pagination';
import { SubscriptionTriggers } from 'src/common/subscriptions/subscription-triggers.enum';
import { EventPayload } from 'src/common/subscriptions/subscription.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';

@Injectable()
export class EventService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pubsub: PubSubService,
  ) {}

  getEvent(eventId: number): Prisma.Prisma__EventClient<Event> {
    return this.prisma.event.findUniqueOrThrow({
      where: {
        id: eventId,
      },
    });
  }

  getEvents(chatId: number, args: PaginationArgs): Promise<Connection<Event>> {
    return findManyCursorConnection<
      Event,
      Pick<Prisma.UserWhereUniqueInput, 'id'>
    >(
      (args) => {
        return this.prisma.event.findMany({
          ...args,
          ...{
            where: { chatId },
            orderBy: {
              createdAt: 'asc',
            },
          },
        });
      },

      () =>
        this.prisma.event.count({
          where: {
            id: chatId,
          },
        }),
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

  async deleteEvent(eventId: number, deletedById: number): Promise<Event> {
    const event = await this.prisma.event.update({
      data: {
        deletedAt: new Date(),
      },
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
      where: {
        id: eventId,
      },
    });

    this.pubsub.publish<EventPayload>(SubscriptionTriggers.EventDeleted, {
      recipients: event.chat.members
        .map((x) => x.id)
        .filter((x) => x !== deletedById),
      content: event,
    });

    return event;
  }
}
