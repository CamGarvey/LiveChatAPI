import { UseGuards } from '@nestjs/common';
import { Resolver, Args, Query, ResolveField, Parent } from '@nestjs/graphql';
import { ChatGuard } from 'src/common/guards/chat.guard';
import { MemberService } from '../member.service';
import Member from '../models/interfaces/member.interface';
import { PaginatedMember } from '../models/paginated-member.model';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import { PaginationArgs } from 'src/prisma/models/pagination';

@Resolver(() => Member)
export class MemberInterfaceResolver {
  constructor(private readonly memberService: MemberService) {}

  @ResolveField()
  async user(@Parent() parent: Member) {
    return await this.memberService.getMember(parent.id).user();
  }

  @ResolveField()
  async chat(@Parent() parent: Member) {
    return await this.memberService.getMember(parent.id).chat();
  }

  @ResolveField()
  async addedBy(@Parent() parent: Member) {
    return await this.memberService.getMember(parent.id).addedBy();
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
