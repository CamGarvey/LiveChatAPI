import { Connection } from '@devoxa/prisma-relay-cursor-connection';
import { Resolver, Args, Query, ObjectType } from '@nestjs/graphql';
import { ChatService } from 'src/chat/chat.service';
import { Paginated, PaginationArgs } from 'src/common/pagination';
import { MemberService } from '../member.service';
import Member from '../models/interfaces/member.interface';

@Resolver(() => Member)
export class MemberInterfaceResolver {
  constructor(private readonly memberService: MemberService) {}

  @Query(() => PaginatedMember)
  async members(@Args('chatId') chatId: number, @Args() args: PaginationArgs) {
    return await this.memberService.getMembers(chatId, args);
  }
}

@ObjectType()
export class PaginatedMember extends Paginated(Member) {}
