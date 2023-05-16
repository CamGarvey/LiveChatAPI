import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { ChatService } from 'src/chat/chat.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ChatGuard } from 'src/common/guards/chat.guard';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import { PubSubService } from 'src/pubsub/pubsub.service';
import Chat from '../chat.interface';
import DeletedChat from '../deleted-chat/deleted-chat.model';

@Resolver(() => Chat)
export class ChatInterfaceResolver {
  constructor(
    private readonly chatService: ChatService,
    private readonly pubsub: PubSubService,
  ) {}

  @ResolveField()
  async createdBy(@Parent() parent: Chat) {
    return await this.chatService.getChat(parent.id).createdBy();
  }

  @ResolveField()
  async isCreator(@Parent() parent: Chat, @CurrentUser() user: IAuthUser) {
    return parent.createdById === user.id;
  }

  @Query(() => Chat)
  @UseGuards(ChatGuard)
  async chat(@Args('chatId', { type: () => HashIdScalar }) chatId: number) {
    return this.chatService.getChat(chatId);
  }

  @Mutation(() => DeletedChat)
  @Roles('OWNER')
  async deletedChat(
    @Args('chatId', { type: () => HashIdScalar }) chatId: number,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.chatService.deleteChat(chatId, user.id);
  }

  @Subscription(() => Chat, {
    resolve: (payload) => payload,
  })
  async chats(@CurrentUser() user: IAuthUser) {
    return this.pubsub.asyncIterator<Chat>(`user-chats/${user.id}`, {
      pattern: true,
    });
  }
}
