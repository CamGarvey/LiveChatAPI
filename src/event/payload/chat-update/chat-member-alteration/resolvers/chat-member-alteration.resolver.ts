import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import ChatMemberAlteration from '../models/interface/chat-member-alteration.interface';
import { EventService } from 'src/event/event.service';
import { ChatUpdateService } from '../../services/chat-update.service';

@Resolver(() => ChatMemberAlteration)
export class ChatMemberAlterationResolver {
  constructor(private readonly chatUpdateService: ChatUpdateService) {}

  @ResolveField()
  async members(@Parent() parent: ChatMemberAlteration) {
    return await this.chatUpdateService.getChatUpdate(parent.eventId).members();
  }
}
