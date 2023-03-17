import { Connection } from '@devoxa/prisma-relay-cursor-connection';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { FilterPaginationArgs } from 'src/common/pagination';
import User from '../models/interfaces/user.interface';
import Me from '../models/me.model';
import Stranger from '../models/stranger.model';
import { UserService } from '../user.service';

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
