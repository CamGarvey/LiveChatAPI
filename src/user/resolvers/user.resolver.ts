import {
  Resolver,
  Args,
  Query,
  ObjectType,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { FilterPaginationArgs, Paginated } from 'src/common/models/pagination';
import User from '../models/interfaces/user.interface';
import { UserService } from '../services/user.service';
import { FriendService } from '../friend/services/friend.service';

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

@ObjectType()
export class PaginatedUser extends Paginated(User) {}
