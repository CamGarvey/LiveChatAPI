import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { IContext } from 'src/auth/interfaces/context.interface';
import { ChatService } from 'src/chat/chat.service';
import { CurrentUser } from 'src/common/current-user.decorator';
import { Paginated, PaginationArgs } from 'src/common/pagination';
import { SubscriptionTriggers } from 'src/common/subscriptions/subscription-triggers.enum';
import { EventPayload } from 'src/common/subscriptions/subscription.model';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { UserService } from 'src/user/user.service';
import { EventService } from '../event.service';
import DeletedEvent from '../models/deleted-event.model';
import Event from '../models/interfaces/event.interface';

const isUserRecipient = (
  payload: EventPayload,
  variables: any,
  { user }: IContext,
) => {
  if (variables.chatId) {
    return (
      payload.content.createdById !== user.id &&
      payload.content.chatId == variables.chatId
    );
  }
  return payload.recipients.includes(user.id);
};

@Resolver(() => Event)
export class EventInterfaceResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly pubsub: PubSubService,
  ) {}

  @ResolveField()
  async chat(@Parent() parent: Event) {
    return this.chatService.getChat(parent.chatId);
  }

  @ResolveField()
  async createdBy(@Parent() parent: Event) {
    return this.userService.getUser(parent.createdById);
  }

  @ResolveField()
  async isCreator(@Parent() parent: Event, @CurrentUser() user: IAuthUser) {
    return parent.createdById === user.id;
  }

  @Query(() => Event)
  async event(@Args('eventId') eventId: number) {
    return this.eventService.getEvent(eventId);
  }

  @Query(() => PaginatedEvent)
  async events(@Args('chatId') chatId: number, @Args() args: PaginationArgs) {
    return this.eventService.getEvents(chatId, args);
  }

  @Mutation(() => DeletedEvent)
  async deletedEvent(@Args('eventId') eventId: number) {
    return this.eventService.deleteEvent(eventId);
  }

  @Subscription(() => Event, {
    name: 'events',
    filter: isUserRecipient,
  })
  async eventSubscription() {
    return this.pubsub.asyncIterator('event.*', { pattern: true });
  }

  @Subscription(() => Event, {
    filter: isUserRecipient,
  })
  async eventUpdated() {
    return this.pubsub.asyncIterator(SubscriptionTriggers.EventUpdated);
  }

  @Subscription(() => DeletedEvent, {
    filter: isUserRecipient,
  })
  async eventDeleted() {
    return this.pubsub.asyncIterator(SubscriptionTriggers.EventDeleted);
  }
}

@ObjectType()
export class PaginatedEvent extends Paginated(Event) {}
