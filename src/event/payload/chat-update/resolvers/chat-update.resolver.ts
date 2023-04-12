import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import ChatUpdate from '../models/interface/chat-update.interface';
import { ChatUpdateService } from '../services/chat-update.service';

@Resolver(() => ChatUpdate)
export class ChatUpdateInterfaceResolver {
  constructor(private readonly chatUpdateService: ChatUpdateService) {}

  @ResolveField()
  event(@Parent() parent: ChatUpdate) {
    return this.chatUpdateService.getChatUpdate(parent.eventId).event();
  }
}
