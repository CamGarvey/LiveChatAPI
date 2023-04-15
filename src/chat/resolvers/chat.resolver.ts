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
import { IContext } from 'src/auth/interfaces/context.interface';
import { ChatService } from 'src/chat/chat.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ChatGuard } from 'src/common/guards/chat.guard';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import { SubscriptionPayload } from 'src/common/subscriptions/subscription-payload.model';
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
    filter: (payload: SubscriptionPayload<Chat>, _, { user }: IContext) => {
      return payload.recipients.includes(user.id);
    },
    resolve: (payload: SubscriptionPayload<Chat>) => payload.content,
  })
  async chats() {
    return this.pubsub.asyncIterator<Chat>('chat.*', { pattern: true });
  }
}
