import {
  Connection,
  findManyCursorConnection,
} from '@devoxa/prisma-relay-cursor-connection';
import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { FilterPaginationArgs } from 'src/common/models/pagination';
import { SubscriptionTriggers } from 'src/common/subscriptions/subscription-triggers.enum';
import { NotificationPayload } from 'src/common/subscriptions/subscription.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { FriendCacheService } from 'src/user/friend/resolvers/friend-cache.service';

@Injectable()
export class FriendService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pubsub: PubSubService,
    private readonly friendCacheService: FriendCacheService,
  ) {}

  async createFriend(userId: number, createdById: number): Promise<User> {
    const user = await this.prisma.user.update({
      where: {
        id: createdById,
      },
      data: {
        friends: {
          connect: {
            id: userId,
          },
        },
        friendsOf: {
          connect: {
            id: userId,
          },
        },
      },
    });

    await this.friendCacheService.addFriendship(userId, createdById);

    return user;
  }

  async deleteFriend(userId: number, deletedById: number): Promise<User> {
    const deletedFriend = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        friends: {
          disconnect: {
            id: deletedById,
          },
        },
        friendsOf: {
          disconnect: {
            id: deletedById,
          },
        },
      },
    });

    await this.friendCacheService.removeFriendship(userId, deletedById);

    // Create alert for deleted friend
    const alert = await this.prisma.alert.create({
      data: {
        type: 'FRIEND_DELETED',
        recipients: {
          connect: {
            id: deletedFriend.id,
          },
        },
        createdById: deletedById,
      },
    });

    // Publish notification to deleted friend
    this.pubsub.publish<NotificationPayload>(
      SubscriptionTriggers.FriendDeletedAlert,
      {
        recipients: [userId],
        content: alert,
      },
    );

    return deletedFriend;
  }

  async getAllFriendIds(userId: number): Promise<Set<number>> {
    const cached = await this.friendCacheService.getFriends(userId);

    if (cached) {
      return cached;
    }

    const friends = await this.prisma.user.findMany({
      select: {
        id: true,
      },
      where: {
        friends: {
          some: {
            id: userId,
          },
        },
      },
    });

    const friendIds: Set<number> = new Set(friends.map(({ id }) => id));

    await this.friendCacheService.setFriends(userId, friendIds);

    return friendIds;
  }

  async getFriends(
    userId: number,
    filterPaginationArgs: FilterPaginationArgs,
  ): Promise<Connection<User>> {
    const where = this.getUserWhereValidator(filterPaginationArgs.filter);

    return findManyCursorConnection<
      User,
      Pick<Prisma.UserWhereUniqueInput, 'id'>
    >(
      (args) =>
        this.prisma.user
          .findUniqueOrThrow({
            where: {
              id: userId,
            },
          })
          .friends({
            where,
            ...args,
          }),
      () =>
        this.prisma.user
          .findUniqueOrThrow({
            include: {
              _count: {
                select: {
                  friends: true,
                },
              },
            },
            where: {
              id: userId,
            },
          })
          .then((result) => result._count.friends),
      filterPaginationArgs,
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
    otherUserId: number,
    filterPaginationArgs: FilterPaginationArgs,
  ): Promise<Connection<User>> {
    const userWhere = this.getUserWhereValidator(filterPaginationArgs.filter);
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
              id: otherUserId,
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
      filterPaginationArgs,
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
