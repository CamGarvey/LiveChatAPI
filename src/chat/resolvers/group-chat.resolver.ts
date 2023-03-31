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
import { ChatGuard } from 'src/common/guards/chat.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PaginationArgs } from 'src/common/models/pagination';
import { Roles } from 'src/common/decorators/roles.decorator';
import ChatDescriptionUpdate from 'src/event/models/payloads/chat-description-update.model';
import ChatMembersAddedUpdate from 'src/event/models/payloads/chat-members-added-update.model';
import ChatMembersRemovedUpdate from 'src/event/models/payloads/chat-members-removed-update.model';
import ChatNameUpdate from 'src/event/models/payloads/chat-name-update.model';
import { MemberService } from 'src/member/member.service';
import { ChatService } from '../chat.service';
import GroupChat from '../models/group-chat.model';
import { CreateGroupChatInput } from '../models/inputs/create-group-chat.input';
import { DescriptionUpdateInput } from '../models/inputs/description-update.input';
import { NameUpdateInput } from '../models/inputs/name-update.input';
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

  @Mutation(() => GroupChat)
  async createGroupChat(
    @Args('createGroupChatData')
    { name, description, userIds }: CreateGroupChatInput,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.chatService.createGroupChat(
      name,
      description,
      userIds,
      user.id,
    );
  }

  @Mutation(() => ChatNameUpdate)
  @UseGuards(ChatGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async updateGroupChatName(
    @Args('chatNameData') { chatId, name }: NameUpdateInput,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.chatService.updateGroupChatName(chatId, name, user.id);
  }

  @Mutation(() => ChatDescriptionUpdate)
  @UseGuards(ChatGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async updateGroupChatDescription(
    @Args('chatDescriptionData')
    { chatId, description }: DescriptionUpdateInput,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.chatService.updateGroupChatName(chatId, description, user.id);
  }

  @Mutation(() => ChatMembersAddedUpdate)
  @UseGuards(ChatGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async addMembers(
    @Args('addMembersData') { chatId, userIds }: MemberAlterationInput,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.chatService.addMembers(chatId, userIds, user.id);
  }

  @Mutation(() => ChatMembersRemovedUpdate)
  @UseGuards(ChatGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async removeMembers(
    @Args('removeMembersData') { chatId, userIds }: MemberAlterationInput,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.chatService.removeMembers(chatId, userIds, user.id);
  }
}
