import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ChatService } from 'src/chat/chat.service';
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

  @Mutation(() => DeletedEvent)
  async deletedEvent(@Args('eventId') eventId: number) {
    return this.eventService.deleteEvent(eventId);
  }
}
