import { Injectable } from '@nestjs/common';
import { Request } from '@prisma/client';
import { SubscriptionTriggers } from 'src/common/subscriptions/subscription-triggers.enum';
import { NotificationPayload } from 'src/common/subscriptions/subscription.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';

@Injectable()
export class RequestService {
  private currentUserId: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly pubsub: PubSubService,
  ) {}

  async sendFriendRequest(userId: number): Promise<Request> {
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
            id: this.currentUserId,
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
          createdById: this.currentUserId,
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

  async acceptRequest(requestId: number): Promise<Request> {
    // Get the request
    const request = await this.prisma.request.update({
      data: {
        state: 'ACCEPTED',
      },
      where: {
        id: requestId,
      },
    });
    // Respond to the request and create an alert
    const alert = await this.prisma.alert.upsert({
      create: {
        type: 'REQUEST_ACCEPTED',
        createdById: this.currentUserId,
        recipients: {
          connect: {
            id: request.createdById,
          },
        },
        requestId,
      },
      update: {},
      where: {
        requestId,
      },
    });

    if (request.type === 'FRIEND_REQUEST') {
      // Add as friend
      await this.prisma.user.update({
        where: {
          id: this.currentUserId,
        },
        data: {
          friends: {
            connect: {
              id: request.createdById,
            },
          },
          friendsOf: {
            connect: {
              id: request.createdById,
            },
          },
        },
      });
    }

    // Publish alert
    this.pubsub.publish<NotificationPayload>(
      SubscriptionTriggers.RequestAcceptedAlert,
      {
        recipients: [request.createdById],
        content: alert,
      },
    );

    return request;
  }

  async declineRequest(requestId: number): Promise<Request> {
    // Decline request
    const request = await this.prisma.request.update({
      data: {
        state: 'DECLINED',
      },
      where: {
        id: requestId,
      },
    });
    // Create an response alert
    const alert = await this.prisma.alert.upsert({
      create: {
        type: 'REQUEST_DECLINED',
        createdById: this.currentUserId,
        recipients: {
          connect: {
            id: request.createdById,
          },
        },
        requestId,
      },
      update: {},
      where: {
        requestId,
      },
    });

    // Publish alert to the creator
    this.pubsub.publish<NotificationPayload>(
      SubscriptionTriggers.RequestCancelled,
      {
        recipients: [request.createdById],
        content: alert,
      },
    );

    return request;
  }

  async cancelRequest(requestId: number): Promise<Request> {
    const request = await this.prisma.request.update({
      data: {
        state: 'CANCELLED',
      },
      where: {
        id: requestId,
      },
    });

    // Publish this deleted request
    this.pubsub.publish<NotificationPayload>(
      SubscriptionTriggers.RequestCancelled,
      {
        recipients: [request.recipientId],
        content: request,
      },
    );

    return request;
  }
}
