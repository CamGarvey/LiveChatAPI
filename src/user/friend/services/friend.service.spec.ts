import { Test, TestingModule } from '@nestjs/testing';
import { FriendService } from './friend.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DeepMockProxy, MockProxy, mock, mockDeep } from 'jest-mock-extended';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LoggerService } from '@nestjs/common';
import { PrismaDeepMockProxy } from 'test/common/proxy';
import { Alert, Prisma, User } from '@prisma/client';
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
    let friendMock: MockProxy<User>;
    let alertMock: MockProxy<Alert>;

    beforeEach(() => {
      friendMock = mock<User>({
        id: 1,
      });
      prismaMock.user.update.mockResolvedValue(friendMock);
      alertMock = mock<Alert>({
        id: 2,
      });
      prismaMock.alert.create.mockResolvedValue(alertMock);
    });

    it('should disconnect user from friends and friendsOf', async () => {
      const deletedById = 2;

      await service.deleteFriend(friendMock.id, deletedById);

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
          id: friendMock.id,
        },
      });
    });

    it('should create a FRIEND_DELETED alert with deleted friend as recipient', async () => {
      const deletedById = 2;

      await service.deleteFriend(friendMock.id, deletedById);

      expect(prismaMock.alert.create).toBeCalledWith({
        data: {
          type: 'FRIEND_DELETED',
          recipients: {
            connect: {
              id: friendMock.id,
            },
          },
          createdById: deletedById,
        },
      });
    });

    it('should publish alert to user', async () => {
      await service.deleteFriend(friendMock.id, 2);

      expect(pubsubMock.publish).toBeCalledWith('user-alerts/1', alertMock);
    });

    it('should return deleted user', async () => {
      await expect(service.deleteFriend(friendMock.id, 2)).resolves.toBe(
        friendMock,
      );
    });
  });

  describe('getFriends', () => {
    const userId = 1;
    let userClientMock: MockProxy<Prisma.Prisma__UserClient<User>>;
    let findManyArgsMock: MockProxy<PrismaFindManyArguments<User>>;
    let paginationArgs: MockProxy<FilterPaginationArgs>;

    beforeEach(() => {
      userClientMock = mock<Prisma.Prisma__UserClient<User>>();
      findManyArgsMock = mock<PrismaFindManyArguments<User>>();

      prismaMock.user.findUniqueOrThrow.mockReturnValue(userClientMock);
    });

    describe('with filter', () => {
      let validator;

      beforeEach(() => {
        paginationArgs = mock<FilterPaginationArgs>({
          filter: 'The',
        });
        validator = Prisma.validator<Prisma.UserWhereInput>()({
          OR: [
            {
              username: {
                contains: paginationArgs.filter,
                mode: 'insensitive',
              },
            },
            {
              name: {
                contains: paginationArgs.filter,
                mode: 'insensitive',
              },
            },
          ],
        });
        prismaMock.user.count.mockResolvedValue(2);
      });

      it('should call PaginationService with correct findAny args', async () => {
        await service.getFriends(userId, paginationArgs);

        const [{ findMany }] = paginationServiceMock.Paginate.mock.calls[0];

        await findMany(findManyArgsMock);

        expect(prismaMock.user.findUniqueOrThrow).toBeCalledWith({
          where: {
            id: userId,
          },
        });
        expect(userClientMock.friends).toBeCalledWith({
          ...findManyArgsMock,
          where: validator,
        });
      });

      it('should call PaginationService with correct aggregate args', async () => {
        await service.getFriends(userId, paginationArgs);

        const [{ aggregate, args }] =
          paginationServiceMock.Paginate.mock.calls[0];

        await aggregate();

        expect(args).toBe(paginationArgs);
        expect(prismaMock.user.count).toBeCalledWith({
          where: {
            friends: {
              some: {
                id: userId,
              },
            },
            ...validator,
          },
        });
      });

      it('should call PaginationService with correct connection args', async () => {
        await service.getFriends(userId, paginationArgs);

        const [{ args }] = paginationServiceMock.Paginate.mock.calls[0];

        expect(args).toBe(paginationArgs);
      });
    });

    describe('without filter', () => {
      beforeEach(() => {
        paginationArgs = mock<FilterPaginationArgs>({
          filter: undefined,
        });
      });

      it('should call PaginationService with correct findAny args', async () => {
        await service.getFriends(userId, paginationArgs);

        const [{ findMany }] = paginationServiceMock.Paginate.mock.calls[0];

        await findMany(findManyArgsMock);

        expect(prismaMock.user.findUniqueOrThrow).toBeCalledWith({
          where: {
            id: userId,
          },
        });
        expect(userClientMock.friends).toBeCalledWith({
          ...findManyArgsMock,
        });
      });

      it('should call PaginationService with correct aggregate args', async () => {
        await service.getFriends(userId, paginationArgs);

        const [{ aggregate, args }] =
          paginationServiceMock.Paginate.mock.calls[0];

        await aggregate();

        expect(args).toBe(paginationArgs);
        expect(prismaMock.user.count).toBeCalledWith();
      });

      it('should call PaginationService with correct connection args', async () => {
        await service.getFriends(userId, paginationArgs);

        const [{ args }] = paginationServiceMock.Paginate.mock.calls[0];

        expect(args).toBe(paginationArgs);
      });
    });
  });
});
