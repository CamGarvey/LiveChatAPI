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
    const key = this.getUserCacheKey(userId);
    return this.cache.wrap<IAuthUser>(key, () => this.getUser(userId));
  }

  private async getUser(userId: number): Promise<IAuthUser> {
    const user = await this.prisma.user.findUniqueOrThrow({
      select: {
        memberOfChats: {
          select: {
            chatId: true,
          },
        },
        friends: {
          select: {
            id: true,
          },
        },
      },
      where: {
        id: userId,
      },
    });

    return {
      id: userId,
      chatIds: new Set(user.memberOfChats.map((m) => m.chatId)),
      friendIds: new Set(user.friends.map((f) => f.id)),
    };
  }

  private getUserCacheKey(userId: number): string {
    return `user.${userId}`;
  }
}
