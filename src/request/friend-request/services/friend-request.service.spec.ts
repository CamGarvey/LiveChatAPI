import { LoggerService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Request } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { PrismaDeepMockProxy } from 'test/common/proxy';
import { FriendService } from 'src/user/friend/services/friend.service';
import { FriendRequestService } from './friend-request.service';

describe('FriendRequestService', () => {
  let service: FriendRequestService;
  let prismaMock: PrismaDeepMockProxy;
  let pubsubMock: DeepMockProxy<PubSubService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendRequestService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: PubSubService,
          useValue: mockDeep<PubSubService>(),
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockDeep<LoggerService>(),
        },
      ],
    }).compile();

    service = module.get<FriendRequestService>(FriendRequestService);
    prismaMock = module.get(PrismaService);
    pubsubMock = module.get(PubSubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
