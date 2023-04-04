import { Connection } from '@devoxa/prisma-relay-cursor-connection';
import { Args, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { FilterPaginationArgs } from 'src/common/models/pagination';
import User from '../../models/interfaces/user.interface';
import Stranger from '../../models/stranger.model';
import { UserService } from '../../services/user.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';

@Resolver(() => Stranger)
export class StrangerResolver {
  constructor(private readonly userService: UserService) {}

  @ResolveField()
  async mutualFriends(
    @Parent() parent: Stranger,
    @Args() filterPaginationArgs: FilterPaginationArgs,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.userService.getMutualFriends(
      parent.id,
      user.id,
      filterPaginationArgs,
    );
  }
}
