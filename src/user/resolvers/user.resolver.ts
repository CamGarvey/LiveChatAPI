import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { FilterPaginationArgs } from 'src/common/models/pagination';
import { FriendService } from '../friend/services/friend.service';
import User from '../models/interfaces/user.interface';
import { PaginatedUser } from '../models/paginated-user.model';
import { UserService } from '../services/user.service';

@Resolver(() => User)
export class UserInterfaceResolver {
  constructor(
    private readonly userServer: UserService,
    private readonly friendService: FriendService,
  ) {}

  @ResolveField()
  async friends(
    @Parent() parent: User,
    @Args() filterPaginationArgs: FilterPaginationArgs,
  ) {
    return this.friendService.getFriends(parent.id, filterPaginationArgs);
  }

  @Query(() => PaginatedUser)
  async users(@Args() filterPaginationArgs: FilterPaginationArgs) {
    return this.userServer.getUsers(filterPaginationArgs);
  }
}
