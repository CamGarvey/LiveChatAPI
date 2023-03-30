import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { ChatService } from 'src/chat/chat.service';
import { ChatGuard } from 'src/common/chat.guard';
import { CurrentUser } from 'src/common/current-user.decorator';
import { Roles } from 'src/common/roles.decorator';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import { UserService } from 'src/user/user.service';
import DeletedChat from '../models/deleted-chat.model';
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
}
