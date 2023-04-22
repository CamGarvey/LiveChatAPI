import { Field, ObjectType } from '@nestjs/graphql';
import Event from 'src/event/models/interfaces/event.interface';
import ChatUpdate from './interface/chat-update.interface';

@ObjectType({
  implements: () => ChatUpdate,
})
export default class NameChangedUpdate implements ChatUpdate {
  @Field()
  nameBefore: string;

  @Field()
  nameAfter: string;

  event: Event;
  eventId: number;
}
