import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
  registerEnumType,
} from '@nestjs/graphql';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { ChatGuard } from 'src/common/guards/chat.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PaginationArgs } from 'src/common/models/pagination';
import { Roles } from 'src/common/decorators/roles.decorator';
import ChatDescriptionUpdate from 'src/event/payload/chat-update/models/chat-description-update.model';
import { MemberService } from 'src/member/member.service';
import GroupChat from '../group-chat.model';
import ChatNameUpdate from 'src/event/payload/chat-update/models/chat-name-update.model';
import { CreateGroupChatInput } from 'src/chat/models/inputs/create-group-chat.input';
import { GroupChatService } from '../services/group-chat.service';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import ChatMembersAddedUpdate from 'src/event/payload/chat-update/chat-member-alteration/models/chat-members-added-update.model';
import ChatMembersRemovedUpdate from 'src/event/payload/chat-update/chat-member-alteration/models/chat-members-removed-update.model';
import { Role } from '@prisma/client';

@Resolver(() => GroupChat)
export class GroupChatResolver {
  constructor(
    private readonly memberService: MemberService,
    private readonly groupChatService: GroupChatService,
  ) {}

  @ResolveField()
  async role(@Parent() parent: GroupChat, @CurrentUser() user: IAuthUser) {
    const members = await this.groupChatService.getChat(parent.id).members({
      where: {
        userId: user.id,
      },
    });
    return members[0].role;
  }

  @ResolveField()
  async members(
    @Parent() parent: GroupChat,
    @Args() paginationArgs: PaginationArgs,
  ) {
    return this.memberService.getMembers(parent.id, paginationArgs);
  }

  @Mutation(() => GroupChat)
  async createGroupChat(
    @Args('createGroupChatData')
    { name, description, userIds }: CreateGroupChatInput,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.groupChatService.createGroupChat(
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
    @Args('chatId', { type: () => HashIdScalar }) chatId: number,
    @Args('name') name: string,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.groupChatService.updateName(chatId, name, user.id);
  }

  @Mutation(() => ChatDescriptionUpdate)
  @UseGuards(ChatGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async updateGroupChatDescription(
    @Args('chatId', { type: () => HashIdScalar }) chatId: number,
    @Args('description') description: string,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.groupChatService.updateDescription(
      chatId,
      description,
      user.id,
    );
  }

  @Mutation(() => ChatMembersAddedUpdate)
  @UseGuards(ChatGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async addMembers(
    @Args('chatId', { type: () => HashIdScalar }) chatId: number,
    @Args('userIds', { type: () => [HashIdScalar] }) userIds: number[],
    @CurrentUser() user: IAuthUser,
  ) {
    return this.groupChatService.addMembers(chatId, userIds, user.id);
  }

  @Mutation(() => ChatMembersRemovedUpdate)
  @UseGuards(ChatGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async removeMembers(
    @Args('chatId', { type: () => HashIdScalar }) chatId: number,
    @Args('userIds', { type: () => [HashIdScalar] }) userIds: number[],
    @CurrentUser() user: IAuthUser,
  ) {
    return this.groupChatService.removeMembers(chatId, userIds, user.id);
  }

  @Mutation(() => ChatMembersRemovedUpdate)
  @UseGuards(ChatGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async changeMemberRoles(
    @Args('chatId', { type: () => HashIdScalar }) chatId: number,
    @Args('userIds', { type: () => [HashIdScalar] }) userIds: number[],
    @Args('role', { type: () => Role }) role: Role,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.groupChatService.changeMemberRoles(
      chatId,
      userIds,
      role,
      user.id,
    );
  }
}

registerEnumType(Role, {
  name: 'Role',
});
