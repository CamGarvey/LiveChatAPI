import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AlertService } from 'src/alert/alert.service';
import { ChatService } from 'src/chat/chat.service';
import Alert from '../models/interfaces/alert.interface';
import ChatAlert from '../models/interfaces/chat-alert.interface';

@Resolver(() => ChatAlert)
export class ChatAlertInterfaceResolver {
  constructor(private readonly chatService: ChatService) {}

  @ResolveField()
  async chat(@Parent() parent: ChatAlert) {
    return this.chatService.getChat(parent.chatId);
  }
}
