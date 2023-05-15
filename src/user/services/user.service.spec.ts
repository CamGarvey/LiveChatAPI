import { PrismaFindManyArguments } from '@devoxa/prisma-relay-cursor-connection';
import { LoggerService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { Cache } from 'cache-manager';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HashService } from 'src/hash/hash.service';
import { FilterPaginationArgs } from 'src/prisma/models/pagination';
import { PaginationService } from 'src/prisma/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaDeepMockProxy } from 'test/common/proxy';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let prismaMock: PrismaDeepMockProxy;
  let hashServiceMock: DeepMockProxy<HashService>;
  let paginationServiceMock: DeepMockProxy<PaginationService>;
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
          provide: PaginationService,
          useValue: mockDeep<PaginationService>(),
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockDeep<LoggerService>(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaMock = module.get(PrismaService);
    paginationServiceMock = module.get(PaginationService);
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

  describe('getUsers', () => {
    it('should get pagination of users', async () => {
      const expectedResult = {
        edges: [
          {
            node: {
              id: 1,
            },
            cursor: '1',
          },
        ],
        nodes: [{ id: 1 }],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: '1',
        },
        totalCount: 10,
      };
      paginationServiceMock.Paginate.mockResolvedValueOnce(expectedResult);

      const result = await service.getUsers({
        first: 1,
      });

      expect(result).toBe(expectedResult);
    });

    describe('without filter', () => {
      it('should pass correct args to prisma excluding where clause', async () => {
        const paginationArgs: FilterPaginationArgs = {
          first: 1,
        };
        const findManyArgs: PrismaFindManyArguments<User> = {
          cursor: {
            id: 1,
            username: 'JakeTheDog',
            name: 'Pancakes',
            createdAt: new Date(),
            email: 'jake@dog.com',
            updatedAt: new Date(),
          },
          skip: 0,
          take: 1,
        };

        await service.getUsers(paginationArgs);

        const [{ findMany, aggregate, args }] =
          paginationServiceMock.Paginate.mock.calls[0];

        await findMany(findManyArgs);
        await aggregate();

        expect(prismaMock.user.findMany).toBeCalledWith(findManyArgs);
        expect(prismaMock.user.count).toBeCalledWith();
        expect(args).toMatchObject(paginationArgs);
      });
    });

    describe('with filter', () => {
      it('should pass correct args to prisma including where clause', async () => {
        const paginationArgs: FilterPaginationArgs = {
          first: 1,
          filter: 'Pan',
        };
        const findManyArgs: PrismaFindManyArguments<User> = {
          cursor: {
            id: 1,
            username: 'JakeTheDog',
            name: 'Pancakes',
            createdAt: new Date(),
            email: 'jake@dog.com',
            updatedAt: new Date(),
          },
          skip: 0,
          take: 1,
        };
        const expectedWhereClause = {
          where: {
            AND: [
              {
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
              },
            ],
          },
        };

        await service.getUsers(paginationArgs);

        const [{ findMany, aggregate, args }] =
          paginationServiceMock.Paginate.mock.calls[0];

        await findMany(findManyArgs);
        await aggregate();

        expect(prismaMock.user.findMany).toBeCalledWith({
          ...findManyArgs,
          ...expectedWhereClause,
        });
        expect(prismaMock.user.count).toBeCalledWith(expectedWhereClause);
        expect(args).toMatchObject(paginationArgs);
      });
    });
  });
});
