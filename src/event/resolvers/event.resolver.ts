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
import { ChatGuard } from 'src/common/guards/chat.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { EventGuard } from 'src/common/guards/event.guard';
import { Paginated, PaginationArgs } from 'src/common/models/pagination';
import { Roles } from 'src/common/decorators/roles.decorator';
import { SubscriptionPayload } from 'src/common/subscriptions/subscription-payload.model';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { EventService } from '../event.service';
import DeletedEvent from '../models/deleted-event.model';
import Event from '../models/interfaces/event.interface';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';

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
    filter: (payload: SubscriptionPayload<Event>, _, user: IAuthUser) =>
      payload.recipients.includes(user.id),
    resolve: (payload: SubscriptionPayload<Event>) => payload.content,
  })
  async eventSubscription() {
    return this.pubsub.asyncIterator('event.*', { pattern: true });
  }
}

@ObjectType()
export class PaginatedEvent extends Paginated(Event) {}
