import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { EventService } from '../event.service';
import CreatedEvent from '../models/created-event.model';
import { GraphQLError } from 'graphql';
import ChatUpdate from '../models/payloads/interfaces/chat-update.interface';
import Message from '../models/payloads/message.model';

@Resolver(() => CreatedEvent)
export class CreatedEventResolver {
  constructor(private readonly eventService: EventService) {}

  @ResolveField()
  async payload(@Parent() parent: CreatedEvent) {
    const event = this.eventService.getEvent(parent.id);

    switch (parent.type) {
      case 'MESSAGE':
        return await event.message();
      case 'CHAT_UPDATE':
        return await event.chatUpdate();
      default:
        throw new GraphQLError('Event type not supported');
    }
  }
}
