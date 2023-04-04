import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import ChatMemberAlteration from '../models/interface/chat-member-alteration.interface';
import { EventService } from 'src/event/event.service';

@Resolver(() => ChatMemberAlteration)
export class ChatMemberAlterationResolver {
  constructor(private readonly eventService: EventService) {}

  @ResolveField()
  async members(@Parent() parent: ChatMemberAlteration) {
    return await this.eventService
      .getEvent(parent.eventId)
      .chatUpdate()
      .members();
  }
}
