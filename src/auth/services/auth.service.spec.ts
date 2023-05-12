import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { LoggerService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HashService } from 'src/hash/hash.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { Member, User } from '@prisma/client';
import { PrismaDeepMockProxy } from 'test/common/proxy';

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: PrismaDeepMockProxy;
  let hashServiceMock: DeepMockProxy<HashService>;
  let cacheMock: DeepMockProxy<Cache>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: HashService,
          useValue: mockDeep<HashService>(),
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockDeep<Cache>(),
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockDeep<LoggerService>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaMock = module.get(PrismaService);
    hashServiceMock = module.get(HashService);
    cacheMock = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isUsernameTaken', () => {
    it('should contain username in where clause', async () => {
      prismaMock.user.count.mockResolvedValueOnce(0);

      const isTaken = await service.isUsernameTaken('cam');

      expect(isTaken).toBe(false);
    });

    it('should return false if user count is 0', async () => {
      const username = 'cam';
      prismaMock.user.count.mockResolvedValueOnce(0);

      await service.isUsernameTaken(username);

      expect(prismaMock.user.count).toBeCalledWith({
        where: {
          username,
        },
      });
    });

    it('should return true if user count is greater than 0', async () => {
      prismaMock.user.count.mockResolvedValueOnce(1);

      const isTaken = await service.isUsernameTaken('cam');

      expect(isTaken).toBe(true);
    });
  });

  describe('createUser', () => {
    const userData = {
      name: 'cam',
      email: 'cam@cam.com',
      username: 'cam',
    };

    it('should encode and return user id', async () => {
      const userId = 1;
      const expectedEncodedValue = 'ecoded';
      prismaMock.user.create.mockResolvedValueOnce({
        id: userId,
      } as unknown as User);

      hashServiceMock.encode.mockReturnValue(expectedEncodedValue);

      const encodedId = await service.createUser(userData);

      expect(encodedId).toBe(expectedEncodedValue);
      expect(hashServiceMock.encode).toBeCalledWith(userId);
    });

    it('should be called with user data', async () => {
      prismaMock.user.create.mockResolvedValueOnce({
        id: 1,
      } as unknown as User);
      const encodedId = await service.createUser(userData);

      expect(prismaMock.user.create).toBeCalledWith({
        select: {
          id: true,
        },
        data: userData,
      });
    });
  });

  describe('getAuthUser', () => {
    it('should return an IAuthUser with id same as userId arg', async () => {
      const expectedId = 50;
      const authUser = await service.getAuthUser(expectedId);

      expect(authUser.id).toBe(expectedId);
    });

    describe('getChats', () => {
      it('should create user cache key', async () => {
        const userId = 3;

        const authUser = await service.getAuthUser(userId);
        await authUser.getChats();

        const [key] = cacheMock.wrap.mock.calls[0];
        expect(key).toBe(`user.${userId}.chats`);
      });

      it('should call prisma for chats if no cache', async () => {
        const userId = 3;
        prismaMock.member.findMany.mockResolvedValueOnce([
          {
            chat: { id: 1 },
          },
          {
            chat: { id: 2 },
          },
          {
            chat: { id: 3 },
          },
        ] as unknown as Member[]);

        const authUser = await service.getAuthUser(userId);
        await authUser.getChats();
        const [, getChatsFunc] = cacheMock.wrap.mock.calls[0];
        const chats = (await getChatsFunc()) as Set<number>;

        expect(chats.size).toBe(3);
        expect(chats).toContain(1);
        expect(chats).toContain(2);
        expect(chats).toContain(3);
      });

      it('should only get members that are not removed and have userId', async () => {
        const userId = 3;
        prismaMock.member.findMany.mockResolvedValueOnce([]);

        const authUser = await service.getAuthUser(userId);
        await authUser.getChats();
        const [, getChatsFunc] = cacheMock.wrap.mock.calls[0];
        await getChatsFunc();

        expect(prismaMock.member.findMany).toBeCalledWith({
          select: {
            chat: {
              select: {
                id: true,
              },
            },
          },
          where: {
            userId,
            removedAt: null,
          },
        });
      });
    });

    describe('getUserFriends', () => {
      it('should create user cache key', async () => {
        const userId = 3;

        const authUser = await service.getAuthUser(userId);
        await authUser.getFriends();

        const [key] = cacheMock.wrap.mock.calls[0];
        expect(key).toBe(`user.${userId}.friends`);
      });

      it('should call prisma for friends if no cache', async () => {
        const userId = 3;
        prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({
          friends: [
            {
              id: 1,
            },
            {
              id: 2,
            },
            {
              id: 3,
            },
          ],
        } as unknown as User);

        const authUser = await service.getAuthUser(userId);
        await authUser.getFriends();
        const [, getFriendsFunc] = cacheMock.wrap.mock.calls[0];
        const friends = (await getFriendsFunc()) as Set<number>;

        expect(friends.size).toBe(3);
        expect(friends).toContain(1);
        expect(friends).toContain(2);
        expect(friends).toContain(3);
      });

      it('should only get userId friends', async () => {
        const userId = 3;
        prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({
          friends: [
            {
              id: 1,
            },
          ],
        } as unknown as User);

        const authUser = await service.getAuthUser(userId);
        await authUser.getFriends();
        const [, getFrindsFunc] = cacheMock.wrap.mock.calls[0];
        await getFrindsFunc();

        expect(prismaMock.user.findUniqueOrThrow).toBeCalledWith({
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
        });
      });
    });
  });
});
