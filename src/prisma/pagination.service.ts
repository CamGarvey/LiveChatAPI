import {
  Connection,
  ConnectionArguments,
  PrismaFindManyArguments,
  findManyCursorConnection,
} from '@devoxa/prisma-relay-cursor-connection';
import { Injectable } from '@nestjs/common';

export type Cursor = { id: number };

type PaginationArgs<T> = {
  findMany: (args: PrismaFindManyArguments<Cursor>) => Promise<(T & Cursor)[]>;
  aggregate: () => Promise<number>;
  args?: ConnectionArguments;
};

@Injectable()
export class PaginationService {
  async Paginate<T>({
    findMany,
    aggregate,
    args,
  }: PaginationArgs<T>): Promise<Connection<T>> {
    return findManyCursorConnection<T & Cursor, Cursor>(
      findMany,
      aggregate,
      args,
      {
        getCursor: (record) => ({ id: record.id }),
        encodeCursor: this.encodeCursor,
        decodeCursor: this.decodeCursor,
      },
    );
  }

  private encodeCursor(cursor: Cursor): string {
    return Buffer.from(JSON.stringify(cursor)).toString('base64');
  }

  private decodeCursor(encodedCursor: string): Cursor {
    return JSON.parse(Buffer.from(encodedCursor, 'base64').toString('ascii'));
  }
}
