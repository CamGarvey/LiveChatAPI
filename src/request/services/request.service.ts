import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Prisma, Request } from '@prisma/client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { FriendService } from 'src/user/friend/services/friend.service';

@Injectable()
export class RequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pubsub: PubSubService,
    private readonly friendService: FriendService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  /**
   * Get a request by id
   * @param requestId id of request
   * @returns request
   */
  getRequest(requestId: number): Prisma.Prisma__RequestClient<Request> {
    this.logger.debug('Getting request', { requestId });

    return this.prisma.request.findUniqueOrThrow({
      where: {
        id: requestId,
      },
    });
  }

  /**
   * Accepts a request; updates the state of the request to accepted,
   * and publishes the updated request to the creator of the request
   * @param requestId id of request to be accepted
   * @returns accepted request
   */
  async acceptRequest(requestId: number): Promise<Request> {
    this.logger.debug('Accepting request', { requestId });

    const request = await this.prisma.request.update({
      data: {
        state: 'ACCEPTED',
      },
      where: {
        id: requestId,
      },
    });

    if (request.type === 'FRIEND_REQUEST') {
      await this.friendService.createFriend(
        request.createdById,
        request.recipientId,
      );
    }

    await this.pubsub.publish<Request>(
      `user-requests/${request.createdById}`,
      request,
    );

    return request;
  }

  /**
   * Declines a request; updates the state of the request to declined,
   * and publishes the updated request to the creator of the request
   * @param requestId id of request to be declined
   * @returns declined request
   */
  async declineRequest(requestId: number): Promise<Request> {
    this.logger.debug('Declining request', { requestId });

    const request = await this.prisma.request.update({
      data: {
        state: 'DECLINED',
      },
      where: {
        id: requestId,
      },
    });

    await this.pubsub.publish<Request>(
      `user-requests/${request.createdById}`,
      request,
    );

    return request;
  }

  /**
   * Cancels a request; updates the state of the request to cancelled,
   * and publishes the updated request to recipient
   * @param requestId id of request to be cancelled
   * @returns cancelled request
   */
  async cancelRequest(requestId: number): Promise<Request> {
    this.logger.debug('Cancelling request', { requestId });

    const request = await this.prisma.request.update({
      data: {
        state: 'CANCELLED',
      },
      where: {
        id: requestId,
      },
    });

    await this.pubsub.publish<Request>(
      `user-requests/${request.recipientId}`,
      request,
    );

    return request;
  }

  /**
   * Delete a request from the database
   * @param requestId id of request to be deleted
   * @returns deleted request
   */
  async deletedRequest(requestId: number): Promise<Request> {
    this.logger.debug('Deleting request', { requestId });

    return await this.prisma.request.delete({
      where: {
        id: requestId,
      },
    });
  }
}
