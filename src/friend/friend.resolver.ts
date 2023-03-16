import { Connection } from '@devoxa/prisma-relay-cursor-connection';
import { Args, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { User } from '@prisma/client';
import { FilterPaginationArgs, Paginated } from '../common/pagination';
import { FriendService } from './friend.service';
import Friend from './friend.model';

@Resolver((of) => Friend)
export class FriendResolver {
  constructor(private readonly friendService: FriendService) {}

  @Query(() => PaginatedFriend)
  async friends(@Args() args: FilterPaginationArgs): Promise<Connection<User>> {
    return this.friendService.getFriends(args);
  }
}

@ObjectType()
export class PaginatedFriend extends Paginated(Friend) {}
