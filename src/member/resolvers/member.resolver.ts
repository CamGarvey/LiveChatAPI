import { Resolver, Args, Query } from '@nestjs/graphql';
import { PaginationArgs } from 'src/common/pagination';
import { MemberService } from '../member.service';
import Member from '../models/interfaces/member.interface';
import { PaginatedMember } from '../models/paginated-member.model';

@Resolver(() => Member)
export class MemberInterfaceResolver {
  constructor(private readonly memberService: MemberService) {}

  @Query(() => PaginatedMember)
  async members(@Args('chatId') chatId: number, @Args() args: PaginationArgs) {
    return await this.memberService.getMembers(chatId, args);
  }
}
