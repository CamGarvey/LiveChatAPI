import {
  Connection,
  findManyCursorConnection,
} from '@devoxa/prisma-relay-cursor-connection';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { LoggerService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HashService } from 'src/hash/hash.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Member, User } from '@prisma/client';
import { PrismaDeepMockProxy } from 'test/common/proxy';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let prismaMock: PrismaDeepMockProxy;
  let hashServiceMock: DeepMockProxy<HashService>;
  let cacheMock: DeepMockProxy<Cache>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockDeep<LoggerService>(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaMock = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUser', () => {
    it('should find unique user by userId', () => {
      const expectedUserId = 1;

      service.getUser(expectedUserId);

      expect(prismaMock.user.findUniqueOrThrow).toBeCalledWith({
        where: {
          id: expectedUserId,
        },
      });
    });
  });

  describe('getUserChats', () => {
    it('should get all chats the user is a member of', async () => {
      const expectedUserId = 2;
      prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({
        memberOfChats: [{ chat: { id: 1 } }],
      } as unknown as User);

      const chats = await service.getUserChats(expectedUserId);

      expect(chats).toMatchObject([{ id: 1 }]);
      expect(prismaMock.user.findUniqueOrThrow).toBeCalledWith({
        select: {
          memberOfChats: {
            select: {
              chat: true,
            },
          },
        },
        where: {
          id: expectedUserId,
        },
      });
    });
  });

  describe('getUsers', () => {
    it('should return forward pagination of users', async () => {
      const expectedUserId1 = 1;
      const expectedCursor1 = Buffer.from(
        JSON.stringify({ id: expectedUserId1 }),
      ).toString('base64');
      const expectedUserId2 = 2;
      const expectedCursor2 = Buffer.from(
        JSON.stringify({ id: expectedUserId2 }),
      ).toString('base64');
      const expectedTotalCount = 10;

      prismaMock.user.findMany.mockResolvedValueOnce([
        { id: expectedUserId1 },
        { id: expectedUserId2 },
        { id: 3 }, // findManyCursorConnection will fetch one additional record to determine if there is a next page
      ] as unknown as User[]);
      prismaMock.user.count.mockResolvedValue(expectedTotalCount);

      const users = await service.getUsers({
        first: 2,
      });

      expect(users).toMatchObject({
        edges: [
          {
            node: {
              id: expectedUserId1,
            },
            cursor: expectedCursor1,
          },
          {
            node: {
              id: expectedUserId2,
            },
            cursor: expectedCursor2,
          },
        ],
        nodes: [{ id: expectedUserId1 }, { id: expectedUserId2 }],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: expectedCursor1,
          endCursor: expectedCursor2,
        },
        totalCount: 10,
      });
    });

    it('should return backward pagination of users', async () => {
      const expectedUserId1 = 3;
      const expectedCursor1 = Buffer.from(
        JSON.stringify({ id: expectedUserId1 }),
      ).toString('base64');
      const expectedUserId2 = 2;
      const expectedCursor2 = Buffer.from(
        JSON.stringify({ id: expectedUserId2 }),
      ).toString('base64');
      const expectedTotalCount = 10;

      prismaMock.user.findMany.mockResolvedValueOnce([
        { id: expectedUserId1 },
        { id: expectedUserId2 },
        { id: 1 }, // findManyCursorConnection will fetch one additional record to determine if there is a previous page
      ] as unknown as User[]);
      prismaMock.user.count.mockResolvedValue(expectedTotalCount);

      const users = await service.getUsers({
        last: 2,
      });

      expect(users).toMatchObject({
        edges: [
          {
            node: {
              id: expectedUserId1,
            },
            cursor: expectedCursor1,
          },
          {
            node: {
              id: expectedUserId2,
            },
            cursor: expectedCursor2,
          },
        ],
        nodes: [{ id: expectedUserId1 }, { id: expectedUserId2 }],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: true,
          startCursor: expectedCursor1,
          endCursor: expectedCursor2,
        },
        totalCount: 10,
      });
    });

    jest.mock('@devoxa/prisma-relay-cursor-connection', () => ({
      ...jest.requireActual('@devoxa/prisma-relay-cursor-connection'),
      findManyCursorConnection: jest.fn(),
    }));

    fit('should', async () => {
      const users = await service.getUsers({ first: 1 });

      expect(users).toBe({ id: 2 });
    });
  });
});
