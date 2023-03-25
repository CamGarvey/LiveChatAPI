import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ChatService } from 'src/chat/chat.service';
import { CurrentUserId } from 'src/current-user-id/current-user-id.decorator';
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
  async isCreator(@Parent() parent: Chat, @CurrentUserId() userId: number) {
    return parent.createdById === userId;
  }

  @Query(() => Chat)
  async chat(@Args('chatId') chatId: number) {
    return this.chatService.getChat(chatId);
  }
}
