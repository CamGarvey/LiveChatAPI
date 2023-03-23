import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ChatService } from 'src/chat/chat.service';
import { Paginated, PaginationArgs } from 'src/common/pagination';
import { CurrentUserId } from 'src/current-user-id/user-id.decorator';
import { UserService } from 'src/user/user.service';
import { EventService } from '../event.service';
import DeletedEvent from '../models/deleted-event.model';
import Event from '../models/interfaces/event.interface';

@Resolver(() => Event)
export class EventInterfaceResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly chatService: ChatService,
    private readonly userService: UserService,
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
  async isCreator(@Parent() parent: Event, @CurrentUserId() userId: number) {
    return parent.createdById === userId;
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
}

@ObjectType()
export class PaginatedEvent extends Paginated(Event) {}
