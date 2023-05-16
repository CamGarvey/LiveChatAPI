import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { ChatService } from 'src/chat/chat.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import { DirectMessageChat } from '../direct-messge-chat.model';
import { DirectMessageChatService } from '../services/direct-message-chat.service';

@Resolver(() => DirectMessageChat)
export class DirectMessageChatResolver {
  constructor(
    private readonly chatService: ChatService,
    private readonly directMessageChatService: DirectMessageChatService,
  ) {}

  @ResolveField()
  async recipient(
    @Parent() parent: DirectMessageChat,
    @CurrentUser() user: IAuthUser,
  ) {
    const members = await this.chatService.getChat(parent.id).members();
    return members.find((m) => m.userId !== user.id);
  }

  @Mutation(() => DirectMessageChat)
  async createDirectMessageChat(
    @Args('recipientUserId', { type: () => HashIdScalar })
    recipientUserId: number,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.directMessageChatService.createDirectMessage(
      recipientUserId,
      user.id,
    );
  }
}
