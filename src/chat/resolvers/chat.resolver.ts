import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { ChatService } from 'src/chat/chat.service';
import { ChatMemberGuard } from 'src/common/chat-member.guard';
import { CurrentUser } from 'src/common/current-user.decorator';
import { UserService } from 'src/user/user.service';
import Chat from '../models/interfaces/chat.interfaces';

@Resolver(() => Chat)
export class ChatInterfaceResolver {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  @ResolveField()
  async createdBy(@Parent() parent: Chat) {
    return await this.userService.getUser(parent.createdById);
  }

  @ResolveField()
  async isCreator(@Parent() parent: Chat, @CurrentUser() user: IAuthUser) {
    return parent.createdById === user.id;
  }

  @Query(() => Chat)
  // @UseGuards(ChatMemberGuard)
  async chat(@Args('chatId') chatId: number) {
    return this.chatService.getChat(chatId);
  }
}
