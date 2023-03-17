import {
  Connection,
  findManyCursorConnection,
} from '@devoxa/prisma-relay-cursor-connection';
import { Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Prisma, User } from '@prisma/client';
import { FilterPaginationArgs } from 'src/common/pagination';
import { Subscription } from 'src/common/subscriptions/subscription.enum';
import { NotificationPayload } from 'src/common/subscriptions/subscription.model';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { PrismaService } from '../prisma/prisma.service';
import Friend from './models/friend.model';

@Injectable()
export class UserService {
  private currentUserId: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly pubsub: PubSubService,
  ) {}

  async getUser(userId: number): Promise<User> {
    return this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });
  }

  async getUsers(args: FilterPaginationArgs): Promise<Connection<User>> {
    const where = this.getUserWhereValidator(args.filter);

    return findManyCursorConnection<
      User,
      Pick<Prisma.UserWhereUniqueInput, 'id'>
    >(
      (args) => this.prisma.user.findMany({ ...args, where }),
      () => this.prisma.user.count({ where }),
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

  async deleteFriend(userId: number): Promise<User> {
    const deletedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        friends: {
          disconnect: {
            id: this.currentUserId,
          },
        },
        friendsOf: {
          disconnect: {
            id: this.currentUserId,
          },
        },
      },
    });
    // Create alert for deleted friend
    const alert = await this.prisma.alert.create({
      data: {
        type: 'FRIEND_DELETED',
        recipients: {
          connect: {
            id: deletedUser.id,
          },
        },
        createdById: this.currentUserId,
      },
    });

    // Publish notification to deleted friend
    this.pubsub.publish<NotificationPayload>(Subscription.FriendDeletedAlert, {
      recipients: [userId],
      content: alert,
    });

    return deletedUser;
  }

  async getFriends(
    userId: number,
    args: FilterPaginationArgs,
  ): Promise<Connection<User>> {
    const where = this.getUserWhereValidator(args.filter);

    return findManyCursorConnection<
      User,
      Pick<Prisma.UserWhereUniqueInput, 'id'>
    >(
      (args) =>
        this.prisma.user.findMany({
          ...args,
          where: {
            friendsOf: {
              some: {
                id: userId,
              },
            },
            ...where,
          },
        }),
      () =>
        this.prisma.user.count({
          where: {
            friendsOf: {
              some: {
                id: userId,
              },
            },
            ...where,
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

  async getMutualFriends(
    userId: number,
    args: FilterPaginationArgs,
  ): Promise<Connection<User>> {
    const userWhere = this.getUserWhereValidator(args.filter);
    // Find all users where friends with both
    const where: Prisma.UserWhereInput = {
      AND: [
        {
          friends: {
            some: {
              id: userId,
            },
          },
        },
        {
          friends: {
            some: {
              id: this.currentUserId,
            },
          },
        },
        userWhere,
      ],
    };

    return findManyCursorConnection<
      User,
      Pick<Prisma.UserWhereUniqueInput, 'id'>
    >(
      (args) => {
        return this.prisma.user.findMany({
          ...args,
          ...{
            where,
          },
        });
      },

      () => this.prisma.user.count({ where }),
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

  private getUserWhereValidator(filter: string | null | undefined) {
    return Prisma.validator<Prisma.UserWhereInput>()({
      AND: [
        {
          OR: [
            {
              username: {
                contains: filter ?? undefined,
                mode: 'insensitive',
              },
            },
            {
              name: {
                contains: filter ?? undefined,
                mode: 'insensitive',
              },
            },
          ],
        },
      ],
    });
  }
}
