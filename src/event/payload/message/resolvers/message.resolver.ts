import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import Message from '../models/message.model';
import { MessageService } from '../services/message.service';
import { UseGuards } from '@nestjs/common';
import { ChatGuard } from 'src/common/guards/chat.guard';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { Roles } from 'src/common/decorators/roles.decorator';
import { EventGuard } from 'src/common/guards/event.guard';

@Resolver(() => Message)
export class MessageResolver {
  constructor(private readonly messageService: MessageService) {}

  @ResolveField()
  async event(@Parent() parent: Message) {
    return await this.messageService.getMessage(parent.eventId).event();
  }

  @ResolveField()
  async likedBy(@Parent() parent: Message) {
    return await this.messageService.getMessage(parent.eventId).event();
  }

  @Mutation(() => Message)
  @UseGuards(ChatGuard)
  async createMessage(
    @Args('chatId', { type: () => HashIdScalar }) chatId: number,
    @Args('content') content: string,
    @CurrentUser() user: IAuthUser,
  ) {
    return await this.messageService.createMessage(chatId, content, user.id);
  }

  @Mutation(() => Message)
  @Roles('ADMIN', 'OWNER')
  @UseGuards(EventGuard)
  async updateMessage(
    @Args('eventId', { type: () => HashIdScalar }) eventId: number,
    @Args('content') content: string,
  ) {
    return await this.messageService.updateMessage(eventId, content);
  }
}
