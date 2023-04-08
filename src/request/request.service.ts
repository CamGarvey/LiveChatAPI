import { Injectable } from '@nestjs/common';
import { Request } from '@prisma/client';
import { SubscriptionTriggers } from 'src/common/subscriptions/subscription-triggers.enum';
import { NotificationPayload } from 'src/common/subscriptions/subscription.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { FriendService } from 'src/user/friend/services/friend.service';

@Injectable()
export class RequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pubsub: PubSubService,
    private readonly friendService: FriendService,
  ) {}

  async acceptRequest(requestId: number): Promise<Request> {
    // Update the request
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
        createdById: request.recipientId,
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
      await this.friendService.createFriend(
        request.createdById,
        request.recipientId,
      );
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
        createdById: request.recipientId,
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

    // Publish deleted request
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
