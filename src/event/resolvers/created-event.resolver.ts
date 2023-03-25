import {
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { EventService } from '../event.service';
import CreatedEvent from '../models/created-event.model';
import { GraphQLError } from 'graphql';
import ChatUpdate from '../models/payloads/interfaces/chat-update.interface';
import Message from '../models/payloads/message.model';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { SubscriptionTriggers } from 'src/common/subscriptions/subscription-triggers.enum';

@Resolver(() => CreatedEvent)
export class CreatedEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly pubsub: PubSubService,
  ) {}

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

  @Subscription(() => CreatedEvent, {
    filter(payload, variables, context) {
      console.log({ payload, variables, context });
      return true;
    },
  })
  async eventCreated() {
    return this.pubsub.asyncIterator(SubscriptionTriggers.EventCreated);
  }
}
