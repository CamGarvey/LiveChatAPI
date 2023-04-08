import { Injectable } from '@nestjs/common';
import { Request } from '@prisma/client';
import { SubscriptionTriggers } from 'src/common/subscriptions/subscription-triggers.enum';
import { NotificationPayload } from 'src/common/subscriptions/subscription.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';

@Injectable()
export class FriendRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pubsub: PubSubService,
  ) {}

  async sendFriendRequest(
    userId: number,
    createdById: number,
  ): Promise<Request> {
    const request = await this.prisma.request.upsert({
      create: {
        type: 'FRIEND_REQUEST',
        recipient: {
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
      update: {
        state: 'SENT',
        createdAt: new Date().toISOString(),
      },
      where: {
        recipientId_createdById_type: {
          type: 'FRIEND_REQUEST',
          createdById: createdById,
          recipientId: userId,
        },
      },
    });

    // Publish this new request
    this.pubsub.publish<NotificationPayload>(SubscriptionTriggers.RequestSent, {
      recipients: [userId],
      content: request,
    });

    return request;
  }
}
