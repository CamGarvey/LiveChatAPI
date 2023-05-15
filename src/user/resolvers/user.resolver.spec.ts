import {
  Connection,
  Edge,
  PrismaFindManyArguments,
} from '@devoxa/prisma-relay-cursor-connection';
import { LoggerService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HashService } from 'src/hash/hash.service';
import { FilterPaginationArgs } from 'src/prisma/models/pagination';
import { PaginationService } from 'src/prisma/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaDeepMockProxy } from 'test/common/proxy';
import { UserInterfaceResolver } from './user.resolver';
import { UserService } from '../services/user.service';
import { FriendService } from '../friend/services/friend.service';
import User from '../models/interfaces/user.interface';

describe('UserInterfaceResolver', () => {
  let resolver: UserInterfaceResolver;
  let userServiceMock: DeepMockProxy<UserService>;
  let friendServiceMock: DeepMockProxy<FriendService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserInterfaceResolver,
        {
          provide: UserService,
          useValue: mockDeep<UserService>(),
        },
        {
          provide: FriendService,
          useValue: mockDeep<FriendService>(),
        },
      ],
    }).compile();

    resolver = module.get<UserInterfaceResolver>(UserInterfaceResolver);
    userServiceMock = module.get(UserService);
    friendServiceMock = module.get(FriendService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('fields', () => {
    describe('friends', () => {
      it('should return friends from FriendService', async () => {
        const expectResult = mockDeep<Connection<User & { email: string }>>();
        const userMock = mockDeep<User>();
        const filterPaginationArgsMock = mockDeep<FilterPaginationArgs>();
        friendServiceMock.getFriends.mockResolvedValueOnce(expectResult);

        expect(
          resolver.friends(userMock, filterPaginationArgsMock),
        ).resolves.toEqual(expectResult);
      });

      it('should call FriendService with parent user id and pagination args', async () => {
        const parentMock: User = mockDeep<User>({
          id: 1,
        });
        const paginationArgs: FilterPaginationArgs = {
          first: 1,
        };

        await resolver.friends(parentMock, paginationArgs);

        expect(friendServiceMock.getFriends).toBeCalledWith(
          parentMock.id,
          paginationArgs,
        );
      });
    });
  });

  describe('query', () => {
    describe('users', () => {
      it('should return users from UserService', async () => {
        const expectedResult = mockDeep<Connection<User & { email: string }>>();
        const filterPaginationArgsMock = mockDeep<FilterPaginationArgs>();
        userServiceMock.getUsers.mockResolvedValueOnce(expectedResult);

        expect(resolver.users(filterPaginationArgsMock)).resolves.toEqual(
          expectedResult,
        );
      });

      it('should call UserService getUsers with filterPaginationArgs', async () => {
        const filterPaginationArgsMock = mockDeep<FilterPaginationArgs>();

        await resolver.users(filterPaginationArgsMock);

        expect(userServiceMock.getUsers).toBeCalledWith(
          filterPaginationArgsMock,
        );
      });
    });
  });
});
