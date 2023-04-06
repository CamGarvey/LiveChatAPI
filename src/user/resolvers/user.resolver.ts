import {
  Resolver,
  Args,
  Query,
  ObjectType,
  Mutation,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { FilterPaginationArgs, Paginated } from 'src/common/models/pagination';
import User from '../models/interfaces/user.interface';
import Stranger from '../stranger/models/stranger.model';
import { UserService } from '../services/user.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';

@Resolver(() => User)
export class UserInterfaceResolver {
  constructor(private readonly userServer: UserService) {}

  @ResolveField()
  async friends(
    @Parent() parent: User,
    @Args() filterPaginationArgs: FilterPaginationArgs,
  ) {
    return this.userServer.getFriends(parent.id, filterPaginationArgs);
  }

  @Query(() => PaginatedUser)
  async users(@Args() filterPaginationArgs: FilterPaginationArgs) {
    return this.userServer.getUsers(filterPaginationArgs);
  }

  @Mutation(() => Stranger)
  async deleteFriend(
    @Args('userId', { type: () => HashIdScalar }) userId: number,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.userServer.deleteFriend(userId, user.id);
  }
}

@ObjectType()
export class PaginatedUser extends Paginated(User) {}
