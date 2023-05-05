import {
  Connection,
  findManyCursorConnection,
} from '@devoxa/prisma-relay-cursor-connection';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { PaginationArgs } from 'src/common/models/pagination';
import { SubscriptionTriggers } from 'src/common/subscriptions/subscription-triggers.enum';
import { SubscriptionPayload } from 'src/common/subscriptions/subscription-payload.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class EventService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pubsub: PubSubService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  getEvent(eventId: number): Prisma.Prisma__EventClient<Event> {
    this.logger.debug('Getting event', { eventId });

    return this.prisma.event.findUniqueOrThrow({
      where: {
        id: eventId,
      },
    });
  }

  async getEvents(
    chatId: number,
    paginationArgs: PaginationArgs,
  ): Promise<Connection<Event>> {
    this.logger.debug('Getting events', { chatId, paginationArgs });

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
      paginationArgs,
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
    this.logger.debug('Deleting event', { eventId, deletedById });

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

    this.pubsub.publish<SubscriptionPayload<Event>>(
      SubscriptionTriggers.EventDeleted,
      {
        recipients: event.chat.members
          .map((x) => x.id)
          .filter((x) => x !== deletedById),
        content: event,
      },
    );

    return event;
  }
}
