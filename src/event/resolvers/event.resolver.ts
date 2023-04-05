import { UseGuards } from '@nestjs/common';
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
import { ChatGuard } from 'src/common/guards/chat.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { EventGuard } from 'src/common/guards/event.guard';
import { Paginated, PaginationArgs } from 'src/common/models/pagination';
import { Roles } from 'src/common/decorators/roles.decorator';
import { SubscriptionTriggers } from 'src/common/subscriptions/subscription-triggers.enum';
import { EventPayload } from 'src/common/subscriptions/subscription.model';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { EventService } from '../event.service';
import DeletedEvent from '../models/deleted-event.model';
import Event from '../models/interfaces/event.interface';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';

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
    private readonly pubsub: PubSubService,
  ) {}

  @ResolveField()
  async chat(@Parent() parent: Event) {
    return await this.eventService.getEvent(parent.id).chat();
  }

  @ResolveField()
  async createdBy(@Parent() parent: Event) {
    return await this.eventService.getEvent(parent.id).createdBy();
  }

  @ResolveField()
  async isCreator(@Parent() parent: Event, @CurrentUser() user: IAuthUser) {
    return parent.createdById === user.id;
  }

  @Query(() => Event)
  @UseGuards(EventGuard)
  async event(@Args('eventId', { type: () => HashIdScalar }) eventId: number) {
    return this.eventService.getEvent(eventId);
  }

  @Query(() => PaginatedEvent)
  @UseGuards(ChatGuard)
  async events(
    @Args('chatId', { type: () => HashIdScalar }) chatId: number,
    @Args() paginationArgs: PaginationArgs,
  ) {
    return this.eventService.getEvents(chatId, paginationArgs);
  }

  @Mutation(() => DeletedEvent)
  @Roles('ADMIN', 'OWNER')
  @UseGuards(EventGuard)
  async deleteEvent(
    @Args('eventId', { type: () => HashIdScalar }) eventId: number,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.eventService.deleteEvent(eventId, user.id);
  }

  @Subscription(() => Event, {
    name: 'events',
    filter: isUserRecipient,
    resolve: (payload: EventPayload) => payload.content,
  })
  async eventSubscription() {
    return this.pubsub.asyncIterator('event.*', { pattern: true });
  }

  @Subscription(() => Event, {
    filter: isUserRecipient,
    resolve: (payload: EventPayload) => payload.content,
  })
  async eventUpdated() {
    return this.pubsub.asyncIterator(SubscriptionTriggers.EventUpdated);
  }

  @Subscription(() => DeletedEvent, {
    filter: isUserRecipient,
    resolve: (payload: EventPayload) => payload.content,
  })
  async eventDeleted() {
    return this.pubsub.asyncIterator(SubscriptionTriggers.EventDeleted);
  }
}

@ObjectType()
export class PaginatedEvent extends Paginated(Event) {}
