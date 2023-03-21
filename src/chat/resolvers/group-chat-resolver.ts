import { Args, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { PaginationArgs } from 'src/common/pagination';
import { MemberService } from 'src/member/member.service';
import GroupChat from '../models/group-chat.model';

@Resolver(() => GroupChat)
export class GroupChatResolver {
  constructor(private readonly memberService: MemberService) {}

  @ResolveField()
  async members(@Parent() parent: GroupChat, @Args() args: PaginationArgs) {
    return this.memberService.getMembers(parent.id, args);
  }
}
