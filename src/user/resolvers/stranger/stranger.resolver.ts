import { Connection } from '@devoxa/prisma-relay-cursor-connection';
import { Args, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { FilterPaginationArgs } from 'src/common/models/pagination';
import User from '../../models/interfaces/user.interface';
import Stranger from '../../models/stranger.model';
import { UserService } from '../../user.service';

@Resolver(() => Stranger)
export class StrangerResolver {
  constructor(private readonly userService: UserService) {}

  @ResolveField()
  async mutualFriends(
    @Parent() parent: Stranger,
    @Args() args: FilterPaginationArgs,
  ): Promise<Connection<User>> {
    return this.userService.getMutualFriends(parent.id, args);
  }
}
