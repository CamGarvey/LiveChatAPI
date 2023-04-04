import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import ChatUpdate from '../models/interface/chat-update.interface';
import { EventService } from 'src/event/event.service';

@Resolver(() => ChatUpdate)
export class ChatUpdateInterfaceResolver {
  constructor(private readonly eventService: EventService) {}

  @ResolveField()
  async event(@Parent() parent: ChatUpdate) {
    return await this.eventService.getEvent(parent.eventId);
  }
}
