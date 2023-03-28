import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { ChatGuard } from 'src/common/chat.guard';
import { CurrentUser } from 'src/common/current-user.decorator';
import { PaginationArgs } from 'src/common/pagination';
import { MemberRoles } from 'src/common/roles.decorator';
import ChatMembersAddedUpdate from 'src/event/models/payloads/chat-members-added-update.model';
import ChatMembersRemovedUpdate from 'src/event/models/payloads/chat-members-removed-update.model';
import { MemberService } from 'src/member/member.service';
import { ChatService } from '../chat.service';
import GroupChat from '../models/group-chat.model';
import { MemberAlterationInput } from '../models/interfaces/member-alteration.input';

@Resolver(() => GroupChat)
export class GroupChatResolver {
  constructor(
    private readonly memberService: MemberService,
    private readonly chatService: ChatService,
  ) {}

  @ResolveField()
  async members(@Parent() parent: GroupChat, @Args() args: PaginationArgs) {
    return this.memberService.getMembers(parent.id, args);
  }

  @Mutation(() => ChatMembersAddedUpdate)
  @UseGuards(ChatGuard)
  @MemberRoles(Role.ADMIN, Role.OWNER)
  async addMembers(
    @Args('addMembersData') { chatId, userIds }: MemberAlterationInput,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.chatService.addMembers(chatId, userIds, user.id);
  }

  @Mutation(() => ChatMembersRemovedUpdate)
  @UseGuards(ChatGuard)
  @MemberRoles(Role.ADMIN, Role.OWNER)
  async removeMembers(
    @Args('removeMembersData') { chatId, userIds }: MemberAlterationInput,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.chatService.removeMembers(chatId, userIds, user.id);
  }
}
