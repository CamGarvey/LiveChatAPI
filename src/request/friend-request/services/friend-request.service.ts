import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Request } from '@prisma/client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SubscriptionPayload } from 'src/common/subscriptions/subscription-payload.model';
import { SubscriptionTriggers } from 'src/common/subscriptions/subscription-triggers.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';

@Injectable()
export class FriendRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pubsub: PubSubService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async sendFriendRequest(
    userId: number,
    createdById: number,
  ): Promise<Request> {
    this.logger.debug('Sending friend request', { userId, createdById });
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
    this.pubsub.publish<SubscriptionPayload<Request>>(
      SubscriptionTriggers.RequestSent,
      {
        recipients: [userId],
        content: request,
      },
    );

    return request;
  }
}
