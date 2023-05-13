import {
  Args,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { FriendService } from '../friend/services/friend.service';
import User from '../models/interfaces/user.interface';
import { UserService } from '../services/user.service';
import { FilterPaginationArgs, Paginated } from 'src/prisma/models/pagination';

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
