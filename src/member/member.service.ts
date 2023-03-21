import {
  Connection,
  findManyCursorConnection,
} from '@devoxa/prisma-relay-cursor-connection';
import { Injectable } from '@nestjs/common';
import { Member, Prisma } from '@prisma/client';
import { FilterPaginationArgs, PaginationArgs } from 'src/common/pagination';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MemberService {
  constructor(private readonly prisma: PrismaService) {}

  getMembers(
    chatId: number,
    args: PaginationArgs,
  ): Promise<Connection<Member>> {
    return findManyCursorConnection<
      Member,
      Pick<Prisma.MemberWhereInput, 'id'>
    >(
      (args) => this.prisma.member.findMany({ where: { chatId, ...args } }),
      () => this.prisma.member.count({ where: { chatId, ...args } }),
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
}
