import {
  Connection,
  findManyCursorConnection,
} from '@devoxa/prisma-relay-cursor-connection';
import { Injectable } from '@nestjs/common';
import { Chat, Prisma, User } from '@prisma/client';
import { FilterPaginationArgs } from 'src/common/models/pagination';
import { SubscriptionTriggers } from 'src/common/subscriptions/subscription-triggers.enum';
import { NotificationPayload } from 'src/common/subscriptions/subscription.model';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FriendCacheService } from '../friend/resolvers/friend-cache.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pubsub: PubSubService,
  ) {}

  getUser(userId: number): Prisma.Prisma__UserClient<User> {
    return this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });
  }

  async getUserChats(userId: number): Promise<Chat[]> {
    const user = await this.prisma.user.findUniqueOrThrow({
      select: {
        memberOfChats: {
          select: {
            chat: true,
          },
        },
      },
      where: {
        id: userId,
      },
    });

    return user.memberOfChats.map((m) => m.chat);
  }

  async getUsers(
    filterPaginationArgs: FilterPaginationArgs,
  ): Promise<Connection<User>> {
    const where = this.getUserWhereValidator(filterPaginationArgs.filter);

    return findManyCursorConnection<
      User,
      Pick<Prisma.UserWhereUniqueInput, 'id'>
    >(
      (args) => this.prisma.user.findMany({ ...args, where }),
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
