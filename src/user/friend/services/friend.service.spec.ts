import { Test, TestingModule } from '@nestjs/testing';
import { FriendService } from './friend.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LoggerService } from '@nestjs/common';
import { PrismaDeepMockProxy } from 'test/common/proxy';
import { Alert, Prisma, User } from '@prisma/client';
import { SubscriptionTriggers } from 'src/common/subscriptions/subscription-triggers.enum';
import { PaginationService } from 'src/prisma/pagination.service';
import { FilterPaginationArgs } from 'src/prisma/models/pagination';
import { PrismaFindManyArguments } from '@devoxa/prisma-relay-cursor-connection';

describe('FriendService', () => {
  let service: FriendService;
  let prismaMock: PrismaDeepMockProxy;
  let pubsubMock: DeepMockProxy<PubSubService>;
  let paginationServiceMock: DeepMockProxy<PaginationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: PubSubService,
          useValue: mockDeep<PubSubService>(),
        },
        {
          provide: PaginationService,
          useValue: mockDeep<PaginationService>(),
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockDeep<LoggerService>(),
        },
      ],
    }).compile();

    service = module.get<FriendService>(FriendService);
    prismaMock = module.get(PrismaService);
    pubsubMock = module.get(PubSubService);
    paginationServiceMock = module.get(PaginationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFriend', () => {
    it('should connect user as friend', async () => {
      const userId = 1;
      const createdById = 2;

      await service.createFriend(userId, createdById);

      expect(prismaMock.user.update).toBeCalledWith({
        data: {
          friends: {
            connect: {
              id: userId,
            },
          },
          friendsOf: {
            connect: {
              id: userId,
            },
          },
        },
        where: {
          id: createdById,
        },
      });
    });
  });

  describe('deleteFriend', () => {
    it('should disconnect user from friends amd friendsOf', async () => {
      const userId = 1;
      const deletedById = 2;

      await service.deleteFriend(userId, deletedById);

      expect(prismaMock.user.update).toBeCalledWith({
        data: {
          friends: {
            disconnect: {
              id: deletedById,
            },
          },
          friendsOf: {
            disconnect: {
              id: deletedById,
            },
          },
        },
        where: {
          id: userId,
        },
      });
    });

    it('should create a FRIEND_DELETED alert with deleted friend as recipient', async () => {
      const userId = 1;
      const deletedById = 2;
      prismaMock.user.update.mockResolvedValueOnce(mockDeep<User>());

      await service.deleteFriend(userId, deletedById);

      expect(prismaMock.alert.create).toBeCalledWith({
        data: {
          type: 'FRIEND_DELETED',
          recipients: {
            connect: {
              id: userId,
            },
          },
          createdById: deletedById,
        },
      });
    });

    it('should publish alert to user', async () => {
      const userId = 1;
      const deletedById = 2;
      const expectedAlert = mockDeep<Alert>();
      prismaMock.user.update.mockResolvedValueOnce(mockDeep<User>());
      prismaMock.alert.create.mockResolvedValueOnce(expectedAlert);

      await service.deleteFriend(userId, deletedById);

      expect(pubsubMock.publish).toBeCalledWith(
        SubscriptionTriggers.FriendDeletedAlert,
        {
          recipients: [userId],
          content: expectedAlert,
        },
      );
    });

    it('should return deleted user', async () => {
      const userId = 1;
      const deletedById = 2;
      const expectedDeletedUser = mockDeep<User>();
      prismaMock.user.update.mockResolvedValueOnce(expectedDeletedUser);
      prismaMock.alert.create.mockResolvedValueOnce(mockDeep<Alert>());

      const deletedUser = await service.deleteFriend(userId, deletedById);

      expect(deletedUser).toBe(expectedDeletedUser);
    });
  });

  describe('getFriends', () => {
    describe('with filter', () => {
      it('should call PaginationService with correct findAny args', async () => {
        const userId = 1;
        const paginationArgs: FilterPaginationArgs = {
          first: 1,
          filter: 'finn',
        };
        const findManyArgs: PrismaFindManyArguments<User> = {
          cursor: {
            id: 1,
            username: 'FinnTheHuman',
            name: 'Finn',
            createdAt: new Date(),
            email: 'finn@human.com',
            updatedAt: new Date(),
          },
          skip: 0,
          take: 1,
        };
        const userClientMock = mockDeep<Prisma.Prisma__UserClient<User>>();
        prismaMock.user.findUniqueOrThrow.mockReturnValueOnce(userClientMock);

        await service.getFriends(userId, paginationArgs);

        const [{ findMany }] = paginationServiceMock.Paginate.mock.calls[0];

        await findMany(findManyArgs);

        expect(prismaMock.user.findUniqueOrThrow).toBeCalledWith({
          where: {
            id: userId,
          },
        });
        expect(userClientMock.friends).toBeCalledWith({
          ...findManyArgs,
          where: {
            AND: [
              {
                OR: [
                  {
                    username: {
                      contains: 'finn',
                      mode: 'insensitive',
                    },
                  },
                  {
                    name: {
                      contains: 'finn',
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            ],
          },
        });
      });

      it('should call PaginationService with correct aggregate args', async () => {
        const userId = 1;
        const paginationArgs: FilterPaginationArgs = {
          first: 1,
          filter: 'finn',
        };

        prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({
          _count: {
            friends: 10,
          },
        } as unknown as User);

        await service.getFriends(userId, paginationArgs);

        const [{ aggregate, args }] =
          paginationServiceMock.Paginate.mock.calls[0];

        await aggregate();

        expect(args).toBe(paginationArgs);
        expect(prismaMock.user.findUniqueOrThrow).toBeCalledWith({
          include: {
            _count: {
              select: {
                friends: true,
              },
            },
          },
          where: {
            AND: [
              {
                OR: [
                  {
                    username: {
                      contains: 'finn',
                      mode: 'insensitive',
                    },
                  },
                  {
                    name: {
                      contains: 'finn',
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            ],
            id: userId,
          },
        });
      });

      it('should call PaginationService with correct connection args', async () => {
        const userId = 1;
        const paginationArgs: FilterPaginationArgs = {
          first: 1,
          filter: 'finn',
        };

        await service.getFriends(userId, paginationArgs);

        const [{ args }] = paginationServiceMock.Paginate.mock.calls[0];

        expect(args).toBe(paginationArgs);
      });
    });

    describe('without filter', () => {
      it('should call PaginationService with correct findAny args', async () => {
        const userId = 1;
        const paginationArgs: FilterPaginationArgs = {
          first: 1,
          filter: 'finn',
        };
        const findManyArgs: PrismaFindManyArguments<User> = {
          cursor: {
            id: 1,
            username: 'FinnTheHuman',
            name: 'Finn',
            createdAt: new Date(),
            email: 'finn@human.com',
            updatedAt: new Date(),
          },
          skip: 0,
          take: 1,
        };
        const userClientMock = mockDeep<Prisma.Prisma__UserClient<User>>();
        prismaMock.user.findUniqueOrThrow.mockReturnValueOnce(userClientMock);

        await service.getFriends(userId, paginationArgs);

        const [{ findMany }] = paginationServiceMock.Paginate.mock.calls[0];

        await findMany(findManyArgs);

        expect(prismaMock.user.findUniqueOrThrow).toBeCalledWith({
          where: {
            id: userId,
          },
        });
        expect(userClientMock.friends).toBeCalledWith({
          ...findManyArgs,
          where: {
            AND: [
              {
                OR: [
                  {
                    username: {
                      contains: 'finn',
                      mode: 'insensitive',
                    },
                  },
                  {
                    name: {
                      contains: 'finn',
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            ],
          },
        });
      });

      it('should call PaginationService with correct aggregate args', async () => {
        const userId = 1;
        const paginationArgs: FilterPaginationArgs = {
          first: 1,
          filter: 'finn',
        };

        prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({
          _count: {
            friends: 10,
          },
        } as unknown as User);

        await service.getFriends(userId, paginationArgs);

        const [{ aggregate, args }] =
          paginationServiceMock.Paginate.mock.calls[0];

        await aggregate();

        expect(args).toBe(paginationArgs);
        expect(prismaMock.user.findUniqueOrThrow).toBeCalledWith({
          include: {
            _count: {
              select: {
                friends: true,
              },
            },
          },
          where: {
            AND: [
              {
                OR: [
                  {
                    username: {
                      contains: 'finn',
                      mode: 'insensitive',
                    },
                  },
                  {
                    name: {
                      contains: 'finn',
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            ],
            id: userId,
          },
        });
      });

      it('should call PaginationService with correct connection args', async () => {
        const userId = 1;
        const paginationArgs: FilterPaginationArgs = {
          first: 1,
          filter: 'finn',
        };

        await service.getFriends(userId, paginationArgs);

        const [{ args }] = paginationServiceMock.Paginate.mock.calls[0];

        expect(args).toBe(paginationArgs);
      });
    });
  });
});
