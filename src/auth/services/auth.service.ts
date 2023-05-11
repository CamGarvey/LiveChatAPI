import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HashService } from 'src/hash/hash.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { IAuthUser } from '../interfaces/auth-user.interface';
import { INewUserData } from '../interfaces/new-user-data.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
    @Inject(CACHE_MANAGER) private cache: Cache,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async isUsernameTaken(username: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: {
        username,
      },
    });
    return count !== 0;
  }

  async createUser(data: INewUserData): Promise<string> {
    this.logger.debug('Creating new user', data);

    const { id } = await this.prisma.user.create({
      select: {
        id: true,
      },
      data,
    });
    return this.hashService.encode(id);
  }

  async getAuthUser(userId: number): Promise<IAuthUser> {
    return {
      id: userId,
      getChats: () => this.getUserChats(userId),
      getFriends: () => this.getUserFriends(userId),
    };
  }

  private async getUserFriends(userId: number): Promise<Set<number>> {
    const getFriends = () =>
      this.prisma.user
        .findUniqueOrThrow({
          select: {
            friends: {
              select: {
                id: true,
              },
            },
          },
          where: {
            id: userId,
          },
        })
        .then((user) => new Set(user.friends.map((friend) => friend.id)));

    return getFriends();
    return this.cache.wrap<Set<number>>(`user.${userId}.friends`, getFriends);
  }

  private async getUserChats(userId: number): Promise<Set<number>> {
    const getChats = () =>
      this.prisma.user
        .findUniqueOrThrow({
          select: {
            memberOfChats: {
              select: {
                chatId: true,
              },
              where: {
                removedAt: null,
              },
            },
          },
          where: {
            id: userId,
          },
        })
        .then(
          (user) => new Set(user.memberOfChats.map((member) => member.chatId)),
        );

    return getChats();
    return this.cache.wrap<Set<number>>(`user.${userId}.chats`, getChats);
  }
}
