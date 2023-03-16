import {
  Connection,
  findManyCursorConnection,
} from '@devoxa/prisma-relay-cursor-connection';
import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { FilterPaginationArgs } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendService {
  private readonly currentUserId: number = 204;

  constructor(private readonly prisma: PrismaService) {}

  public getFriends(args: FilterPaginationArgs): Promise<Connection<User>> {
    // const where = this.getUserWhereValidator(args.filter);
    return findManyCursorConnection<
      User,
      Pick<Prisma.UserWhereUniqueInput, 'id'>
    >(
      (args) =>
        this.prisma.user.findMany({
          ...args,
          ...{
            where: {
              friendsOf: {
                some: {
                  id: this.currentUserId,
                },
              },
              // ...where,
            },
          },
        }),
      () =>
        this.prisma.user.count({
          where: {
            friendsOf: {
              some: {
                id: this.currentUserId,
              },
            },
            // ...where,
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
