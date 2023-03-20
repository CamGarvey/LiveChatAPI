import { Injectable } from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { Subscription } from 'src/common/subscriptions/subscription.enum';
import { EventPayload } from 'src/common/subscriptions/subscription.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';

@Injectable()
export class EventService {
  currentUserId: number;

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

  async deleteEvent(eventId: number): Promise<Event> {
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

    this.pubsub.publish<EventPayload>(Subscription.EventDeleted, {
      recipients: event.chat.members
        .map((x) => x.id)
        .filter((x) => x !== this.currentUserId),
      content: event,
    });

    return event;
  }
}
