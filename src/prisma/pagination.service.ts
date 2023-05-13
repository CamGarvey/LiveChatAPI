import {
  Connection,
  ConnectionArguments,
  PrismaFindManyArguments,
  findManyCursorConnection,
} from '@devoxa/prisma-relay-cursor-connection';
import { Injectable } from '@nestjs/common';

type Cursor = { id: number };

@Injectable()
export class PaginationService {
  async findMany<T>(
    findMany: (
      args: PrismaFindManyArguments<Cursor>,
    ) => Promise<(T & Cursor)[]>,
    aggregate: () => Promise<number>,
    args?: ConnectionArguments,
  ): Promise<Connection<T>> {
    return findManyCursorConnection<T & Cursor, Cursor>(
      findMany,
      aggregate,
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
