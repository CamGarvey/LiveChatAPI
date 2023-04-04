import { UseGuards } from '@nestjs/common';
import { Resolver, Args, Query, ResolveField, Parent } from '@nestjs/graphql';
import { ChatGuard } from 'src/common/guards/chat.guard';
import { PaginationArgs } from 'src/common/models/pagination';
import { MemberService } from '../member.service';
import Member from '../models/interfaces/member.interface';
import { PaginatedMember } from '../models/paginated-member.model';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import { log } from 'console';

@Resolver(() => Member)
export class MemberInterfaceResolver {
  constructor(private readonly memberService: MemberService) {}

  @ResolveField()
  async user(@Parent() parent: Member) {
    return await this.memberService.getMember(parent.id).user();
  }

  @Query(() => PaginatedMember)
  @UseGuards(ChatGuard)
  async members(
    @Args('chatId', { type: () => HashIdScalar }) chatId: number,
    @Args() paginationArgs: PaginationArgs,
  ) {
    return await this.memberService.getMembers(chatId, paginationArgs);
  }
}
