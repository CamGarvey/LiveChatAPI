import {
  Connection,
  findManyCursorConnection,
} from '@devoxa/prisma-relay-cursor-connection';
import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { FilterPaginationArgs } from 'src/common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import Friend from './models/friend.model';

@Injectable()
export class UserService {
  private currentUserId: number;

  constructor(private prisma: PrismaService) {}

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
