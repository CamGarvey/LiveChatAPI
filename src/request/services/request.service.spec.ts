import { LoggerService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Request } from '@prisma/client';
import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/prisma/prisma.service';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { PrismaDeepMockProxy } from 'test/common/proxy';
import { RequestService } from './request.service';
import { FriendService } from 'src/user/friend/services/friend.service';

describe('RequestService', () => {
  let service: RequestService;
  let prismaMock: PrismaDeepMockProxy;
  let pubsubMock: DeepMockProxy<PubSubService>;
  let friendServiceMock: DeepMockProxy<FriendService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: PubSubService,
          useValue: mockDeep<PubSubService>(),
        },
        {
          provide: FriendService,
          useValue: mockDeep<FriendService>(),
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockDeep<LoggerService>(),
        },
      ],
    }).compile();

    service = module.get<RequestService>(RequestService);
    prismaMock = module.get(PrismaService);
    pubsubMock = module.get(PubSubService);
    friendServiceMock = module.get(FriendService);
  });

  fdescribe('getRequest', () => {
    it('should get unique request using request id', () => {
      const requestId = 93;
      const requestMock = mockDeep<Prisma.Prisma__RequestClient<Request>>();
      prismaMock.request.findUniqueOrThrow.mockReturnValueOnce(requestMock);

      const request = service.getRequest(requestId);

      expect(request).toBe(requestMock);
      expect(prismaMock.request.findUniqueOrThrow).toBeCalledWith({
        where: {
          id: requestId,
        },
      });
    });
  });

  describe('acceptRequest', () => {
    it('should create an ACCEPTED request with request id', async () => {
      const requestId = 432;

      await service.acceptRequest(requestId);

      expect(prismaMock.request.update).toBeCalledWith({
        data: {
          state: 'ACCEPTED',
        },
        where: {
          id: requestId,
        },
      });
    });

    it('should create friend if request type is FRIEND_REQUEST', async () => {
      const requestMock = mock<Request>({
        type: 'FRIEND_REQUEST',
        id: 432,
        createdById: 23,
        recipientId: 54,
      });
      prismaMock.request.update.mockResolvedValueOnce(requestMock);

      await service.acceptRequest(requestMock.id);

      expect(friendServiceMock.createFriend).resolves.toHaveBeenCalledWith(
        requestMock.createdById,
        requestMock.recipientId,
      );
    });
  });
});
