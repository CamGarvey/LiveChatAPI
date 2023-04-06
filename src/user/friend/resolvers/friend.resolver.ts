import { Args, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  FilterPaginationArgs,
  Paginated,
} from '../../../common/models/pagination';
import Friend from '../models/friend.model';
import { UserService } from '../../services/user.service';
import { FriendService } from '../services/friend.service';
import Stranger from 'src/user/stranger/models/stranger.model';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';

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

@ObjectType()
export class PaginatedFriend extends Paginated(Friend) {}
