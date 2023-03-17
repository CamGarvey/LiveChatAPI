import {
  Resolver,
  Args,
  Query,
  ObjectType,
  ResolveField,
  Mutation,
} from '@nestjs/graphql';
import { FilterPaginationArgs, Paginated } from 'src/common/pagination';
import Friend from '../models/friend.model';
import User from '../models/interfaces/user.interface';
import Stranger from '../models/stranger.model';
import { UserService } from '../user.service';

@Resolver(() => User)
export class UserInterfaceResolver {
  constructor(private readonly userServer: UserService) {}

  @Query(() => PaginatedUser)
  async users(@Args() args: FilterPaginationArgs) {
    return this.userServer.getUsers(args);
  }

  @Mutation(() => Stranger)
  async deleteFriend(@Args('userId') userId: number) {
    return this.userServer.deleteFriend(userId);
  }
}

@ObjectType()
export class PaginatedUser extends Paginated(User) {}
