import { LoggerService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HashService } from 'src/hash/hash.service';
import { PrismaService } from 'src/prisma/prisma.service';
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
});
