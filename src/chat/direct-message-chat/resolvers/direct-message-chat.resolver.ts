import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { DirectMessageChat } from '../models/direct-messge-chat.model';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { MemberService } from 'src/member/member.service';
import { DirectMessageChatService } from '../services/direct-message-chat.service';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import { log } from 'console';
import { ChatService } from 'src/chat/chat.service';

@Resolver(() => DirectMessageChat)
export class DirectMessageChatResolver {
  constructor(
    private readonly chatService: ChatService,
    private readonly memberSerivce: MemberService,
    private readonly directMessageChatService: DirectMessageChatService,
  ) {}

  @ResolveField()
  async receipent(
    @Parent() parent: DirectMessageChat,
    @CurrentUser() user: IAuthUser,
  ) {
    const members = await this.chatService.getChat(parent.id).members();
    return members.find((m) => m.userId !== user.id);
  }

  @Mutation(() => DirectMessageChat)
  async createDirectMessageChat(
    @Args('receipentUserId', { type: () => HashIdScalar })
    receipentUserId: number,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.directMessageChatService.create(receipentUserId, user.id);
  }
}
