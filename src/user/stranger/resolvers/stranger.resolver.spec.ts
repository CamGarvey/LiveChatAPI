import { Connection } from '@devoxa/prisma-relay-cursor-connection';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { FriendService } from 'src/user/friend/services/friend.service';
import User from 'src/user/models/interfaces/user.interface';
import Stranger from '../models/stranger.model';
import { StrangerResolver } from './stranger.resolver';

describe('StrangerResolver', () => {
  let resolver: StrangerResolver;
  let friendServiceMock: DeepMockProxy<FriendService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StrangerResolver,
        {
          provide: FriendService,
          useValue: mockDeep<FriendService>(),
        },
      ],
    }).compile();

    resolver = module.get<StrangerResolver>(StrangerResolver);
    friendServiceMock = module.get(FriendService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('fields', () => {
    describe('mutualFriends', () => {
      it('should call FriendService for mutual friends using args', async () => {
        const expectedResult = mockDeep<Connection<User & { email: string }>>();
        const parentMock = mockDeep<Stranger>({
          id: 1,
        });
        const currentUserMock = mockDeep<IAuthUser>({
          id: 2,
        });
        const filterPaginationArgs = {};

        friendServiceMock.getMutualFriends.mockResolvedValueOnce(
          expectedResult,
        );

        const result = await resolver.mutualFriends(
          parentMock,
          filterPaginationArgs,
          currentUserMock,
        );

        expect(result).toBe(expectedResult);
        expect(friendServiceMock.getMutualFriends).toBeCalledWith(
          parentMock.id,
          currentUserMock.id,
          filterPaginationArgs,
        );
      });
    });
  });
});
