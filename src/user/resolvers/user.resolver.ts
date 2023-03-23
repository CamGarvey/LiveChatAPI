import { Resolver, Args, Query, ObjectType, Mutation } from '@nestjs/graphql';
import { FilterPaginationArgs, Paginated } from 'src/common/pagination';
import { CurrentUserId } from 'src/current-user-id/current-user-id.decorator';
import User from '../models/interfaces/user.interface';
import Stranger from '../models/stranger.model';
import { UserService } from '../user.service';

@Resolver(() => User)
export class UserInterfaceResolver {
  constructor(private readonly userServer: UserService) {}

  @Query(() => PaginatedUser)
  async users(
    @Args() args: FilterPaginationArgs,
    @CurrentUserId() userId: number,
  ) {
    console.log(userId);
    return this.userServer.getUsers(args);
  }

  @Mutation(() => Stranger)
  async deleteFriend(@Args('userId') userId: number) {
    return this.userServer.deleteFriend(userId);
  }
}

@ObjectType()
export class PaginatedUser extends Paginated(User) {}
