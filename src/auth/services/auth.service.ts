import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { IAuthUser } from '../interfaces/auth-user.interface';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';
import { INewUserData } from '../interfaces/new-user-data.interface';
import { HashService } from 'src/hash/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
    @Inject(CACHE_MANAGER) private cache: Cache,
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
