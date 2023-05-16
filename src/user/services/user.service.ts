import { Connection } from '@devoxa/prisma-relay-cursor-connection';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Chat, Prisma, User } from '@prisma/client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { FilterPaginationArgs } from 'src/prisma/models/pagination';
import { PaginationService } from 'src/prisma/pagination.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly paginationService: PaginationService,
  ) {}

  getUser(userId: number): Prisma.Prisma__UserClient<User> {
    this.logger.debug('Getting user', { userId });

    return this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });
  }

  async getUserChats(userId: number): Promise<Chat[]> {
    this.logger.debug('Getting user chats', { userId });

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
    this.logger.debug('Getting users', { filterPaginationArgs });

    if (filterPaginationArgs.filter) {
      const where = this.createUserWhereClause(filterPaginationArgs.filter);

      return this.paginationService.Paginate({
        findMany: (args) =>
          this.prisma.user.findMany({
            ...args,
            where,
          }),
        aggregate: () => this.prisma.user.count({ where }),
        args: filterPaginationArgs,
      });
    }

    return this.paginationService.Paginate({
      findMany: (args) => this.prisma.user.findMany({ ...args }),
      aggregate: () => this.prisma.user.count(),
      args: filterPaginationArgs,
    });
  }

  private createUserWhereClause(filter: string) {
    return Prisma.validator<Prisma.UserWhereInput>()({
      OR: [
        {
          username: {
            contains: filter,
            mode: 'insensitive',
          },
        },
        {
          name: {
            contains: filter,
            mode: 'insensitive',
          },
        },
      ],
    });
  }
}
