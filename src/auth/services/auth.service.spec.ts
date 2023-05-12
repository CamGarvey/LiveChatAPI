import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { LoggerService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HashService } from 'src/hash/hash.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: DeepMocked<PrismaService>;
  let hashServiceMock: DeepMocked<HashService>;
  let cacheMock: DeepMocked<Cache>;
  let loggerMock: DeepMocked<LoggerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: createMock<PrismaService>(),
        },
        {
          provide: HashService,
          useValue: createMock<HashService>(),
        },
        {
          provide: CACHE_MANAGER,
          useValue: createMock<Cache>(),
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaMock = module.get(PrismaService);
    hashServiceMock = module.get(HashService);
    cacheMock = module.get(CACHE_MANAGER);
    loggerMock = module.get(WINSTON_MODULE_NEST_PROVIDER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isUsernameTaken', () => {})();
});
