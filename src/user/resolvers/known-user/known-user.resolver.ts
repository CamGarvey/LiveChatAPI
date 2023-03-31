import { Connection } from '@devoxa/prisma-relay-cursor-connection';
import {
  Args,
  Info,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { User } from '@prisma/client';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import { FilterPaginationArgs, Paginated } from 'src/common/models/pagination';
import Friend from 'src/user/models/friend.model';
import KnownUser from '../../models/interfaces/known-user.interface';
import { UserService } from '../../user.service';

@Resolver((type) => KnownUser)
export class KnownUserInterfaceResolver {
  constructor(private readonly userService: UserService) {}

  @ResolveField(() => [Chat])
  chats(
    @Parent() parent: KnownUser,
    @Info() { parentType },
    @Args() args: FilterPaginationArgs,
  ) {
    return [];
  }
}
