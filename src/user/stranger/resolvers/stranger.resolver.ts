import { Args, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { FriendService } from 'src/user/friend/services/friend.service';
import Stranger from '../models/stranger.model';
import { FilterPaginationArgs } from 'src/prisma/models/pagination';

@Resolver(() => Stranger)
export class StrangerResolver {
  constructor(private readonly friendService: FriendService) {}

  @ResolveField()
  async mutualFriends(
    @Parent() parent: Stranger,
    @Args() filterPaginationArgs: FilterPaginationArgs,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.friendService.getMutualFriends(
      parent.id,
      user.id,
      filterPaginationArgs,
    );
  }
}
