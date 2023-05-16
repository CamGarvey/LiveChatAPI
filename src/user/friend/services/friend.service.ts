import {
  Connection,
  findManyCursorConnection,
} from '@devoxa/prisma-relay-cursor-connection';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Alert, Prisma, User } from '@prisma/client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { FilterPaginationArgs } from 'src/prisma/models/pagination';
import { PaginationService } from 'src/prisma/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';

@Injectable()
export class FriendService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pubsub: PubSubService,
    private readonly paginationService: PaginationService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async createFriend(userId: number, createdById: number): Promise<User> {
    this.logger.debug('Creating friend', { userId, createdById });

    const user = await this.prisma.user.update({
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
      where: {
        id: createdById,
      },
    });

    return user;
  }

  async deleteFriend(userId: number, deletedById: number): Promise<User> {
    this.logger.debug('Deleting friend', { userId, deletedById });

    const deletedFriend = await this.prisma.user.update({
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
      where: {
        id: userId,
      },
    });

    // Create alert for deleted friend
    const alert = await this.prisma.alert.create({
      data: {
        type: 'FRIEND_DELETED',
        recipients: {
          connect: {
            id: userId,
          },
        },
        createdById: deletedById,
      },
    });

    await this.pubsub.publish<Alert>(`user-alerts/${userId}`, alert);

    return deletedFriend;
  }

  async getFriends(
    userId: number,
    filterPaginationArgs: FilterPaginationArgs,
  ): Promise<Connection<User>> {
    this.logger.debug('Getting friends', { userId, filterPaginationArgs });

    const where = this.getUserWhereValidator(filterPaginationArgs.filter);

    return this.paginationService.Paginate({
      findMany: (args) =>
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
      aggregate: () =>
        this.prisma.user.count({
          where: {
            friends: {
              some: {
                id: userId,
              },
            },
            ...where,
          },
        }),
      args: filterPaginationArgs,
    });
  }

  async getMutualFriends(
    userId: number,
    otherUserId: number,
    filterPaginationArgs: FilterPaginationArgs,
  ): Promise<Connection<User>> {
    this.logger.debug('Getting mutual friends', {
      userId,
      otherUserId,
      filterPaginationArgs,
    });

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
    });
  }
}
