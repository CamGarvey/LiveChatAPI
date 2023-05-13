import { Args, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import Friend from '../models/friend.model';
import Stranger from 'src/user/stranger/models/stranger.model';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import { FilterPaginationArgs } from 'src/prisma/models/pagination';
import { FriendService } from '../services/friend.service';
import { PaginatedFriend } from '../models/paginated-friend.model';

@Resolver(() => Friend)
export class FriendResolver {
  constructor(private readonly friendSerivce: FriendService) {}

  @Query(() => PaginatedFriend)
  async friends(
    @Args() filterPaginationArgs: FilterPaginationArgs,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.friendSerivce.getFriends(user.id, filterPaginationArgs);
  }

  @Mutation(() => Stranger)
  async deleteFriend(
    @Args('userId', { type: () => HashIdScalar }) userId: number,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.friendSerivce.deleteFriend(userId, user.id);
  }
}
