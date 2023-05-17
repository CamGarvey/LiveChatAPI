import { LoggerService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Request } from '@prisma/client';
import { DeepMockProxy, MockProxy, mock, mockDeep } from 'jest-mock-extended';
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

  describe('getRequest', () => {
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
    let requestMock: MockProxy<Request>;

    beforeEach(() => {
      requestMock = mock<Request>({
        type: 'FRIEND_REQUEST',
        id: 222,
        createdById: 222,
        recipientId: 222,
      });
      prismaMock.request.update.mockResolvedValue(requestMock);
    });

    it('should update the request state to ACCEPTED', async () => {
      await service.acceptRequest(requestMock.id);

      expect(prismaMock.request.update).toBeCalledWith({
        data: {
          state: 'ACCEPTED',
        },
        where: {
          id: requestMock.id,
        },
      });
    });

    it('should create a friend if the request type is FRIEND_REQUEST', async () => {
      await service.acceptRequest(requestMock.id);

      expect(friendServiceMock.createFriend).toHaveBeenCalledWith(
        requestMock.createdById,
        requestMock.recipientId,
      );
    });

    it('should publish the request back to the creator', async () => {
      await service.acceptRequest(requestMock.id);

      expect(pubsubMock.publish).toHaveBeenCalledWith(
        `user-requests/${requestMock.createdById}`,
        requestMock,
      );
    });

    it('should return the accepted request', async () => {
      expect(service.acceptRequest(requestMock.id)).resolves.toBe(requestMock);
    });
  });
});
