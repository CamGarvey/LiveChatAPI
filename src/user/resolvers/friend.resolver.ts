import { Connection } from '@devoxa/prisma-relay-cursor-connection';
import { Args, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { User } from '@prisma/client';
import { FilterPaginationArgs, Paginated } from '../../common/pagination';
import Friend from '../models/friend.model';
import { UserService } from '../user.service';

@Resolver((of) => Friend)
export class FriendResolver {
  constructor(private readonly userService: UserService) {}
}

@ObjectType()
export class PaginatedFriend extends Paginated(Friend) {}
