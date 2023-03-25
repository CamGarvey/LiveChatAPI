import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { ChatService } from 'src/chat/chat.service';
import { CurrentUser } from 'src/common/current-user.decorator';
import { Paginated, PaginationArgs } from 'src/common/pagination';
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
}

@ObjectType()
export class PaginatedEvent extends Paginated(Event) {}
