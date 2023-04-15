import {
  Connection,
  findManyCursorConnection,
} from '@devoxa/prisma-relay-cursor-connection';
import { Injectable } from '@nestjs/common';
import { Member, Prisma } from '@prisma/client';
import { PaginationArgs } from 'src/common/models/pagination';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';

@Injectable()
export class MemberService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pubsub: PubSubService,
  ) {}

  getMember(memberId: number): Prisma.Prisma__MemberClient<Member> {
    return this.prisma.member.findUniqueOrThrow({
      where: {
        id: memberId,
      },
    });
  }

  async getMembers(
    chatId: number,
    paginationArgs: PaginationArgs,
  ): Promise<Connection<Member>> {
    return await findManyCursorConnection<
      Member,
      Pick<Prisma.MemberWhereUniqueInput, 'id'>
    >(
      (args) =>
        this.prisma.chat
          .findUniqueOrThrow({
            ...{ where: { id: chatId || undefined } },
          })
          .members({
            ...args,
          }),
      () =>
        this.prisma.chat
          .findUniqueOrThrow({
            ...{ where: { id: chatId || undefined } },
            select: {
              _count: {
                select: {
                  members: true,
                },
              },
            },
          })
          .then((x) => x._count.members),
      paginationArgs,
      {
        getCursor: (record) => ({ id: record.id }),
        encodeCursor: (cursor) =>
          Buffer.from(JSON.stringify(cursor)).toString('base64'),
        decodeCursor: (cursor) =>
          JSON.parse(Buffer.from(cursor, 'base64').toString('ascii')),
      },
    );
  }
}
