import {
  Args,
  Info,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import Chat from 'src/chat/chat.model';
import { FilterPaginationArgs } from 'src/common/pagination';
import Friend from 'src/friend/friend.model';
import User from 'src/user/user.model';
import KnownUser from './known-user.model';

@Resolver((type) => KnownUser)
export class KnownUserInterfaceResolver {
  @ResolveField(() => [Chat])
  chats(
    @Parent() knownUser,
    @Info() { parentType },
    @Args() args: FilterPaginationArgs,
  ) {
    return [];
  }

  @Query((returns) => [Friend])
  friends(
    @Parent() knownUser,
    @Info() { parentType },
    @Args() args: FilterPaginationArgs,
  ) {
    return [];
  }
}
