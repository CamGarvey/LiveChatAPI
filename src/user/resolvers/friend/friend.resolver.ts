import { Args, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  FilterPaginationArgs,
  Paginated,
} from '../../../common/models/pagination';
import Friend from '../../models/friend.model';
import { UserService } from '../../user.service';

@Resolver(() => Friend)
export class FriendResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => PaginatedFriend)
  async friends(
    @Args() args: FilterPaginationArgs,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.userService.getFriends(user.id, args);
  }
}

@ObjectType()
export class PaginatedFriend extends Paginated(Friend) {}
