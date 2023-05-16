import { Test, TestingModule } from '@nestjs/testing';
import { FriendResolver } from './friend.resolver';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { FriendService } from '../services/friend.service';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { User } from '@prisma/client';
import { Connection } from '@devoxa/prisma-relay-cursor-connection';

describe('FriendResolver', () => {
  let resolver: FriendResolver;
  let friendServiceMock: DeepMockProxy<FriendService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendResolver,
        {
          provide: FriendService,
          useValue: mockDeep<FriendService>(),
        },
      ],
    }).compile();

    resolver = module.get<FriendResolver>(FriendResolver);
    friendServiceMock = module.get(FriendService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('query', () => {
    describe('friends', () => {
      it('should get the current users friends', async () => {
        const filterPaginationArgs = {};
        const currentUserMock = mockDeep<IAuthUser>();
        const expectedFriends = mockDeep<Connection<User>>();
        friendServiceMock.getFriends.mockResolvedValueOnce(expectedFriends);

        const friends = await resolver.friends(
          filterPaginationArgs,
          currentUserMock,
        );

        expect(friends).toBe(expectedFriends);
        expect(friendServiceMock.getFriends).toBeCalledWith(
          currentUserMock.id,
          filterPaginationArgs,
        );
      });
    });
  });

  describe('mutation', () => {
    describe('deleteFriend', () => {
      it('should use current user id as deletedById and userId as friend to be deleted', async () => {
        const userId = 50;
        const currentUserMock = mockDeep<IAuthUser>();

        await resolver.deleteFriend(userId, currentUserMock);

        expect(friendServiceMock.deleteFriend).toBeCalledWith(
          userId,
          currentUserMock.id,
        );
      });

      it('should return the delete friend', async () => {
        const expectedDeletedUser = mockDeep<User>();
        friendServiceMock.deleteFriend.mockResolvedValueOnce(
          expectedDeletedUser,
        );

        const deletedFriend = await resolver.deleteFriend(
          1,
          mockDeep<IAuthUser>(),
        );

        expect(deletedFriend).toBe(expectedDeletedUser);
      });
    });
  });
});
