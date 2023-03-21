import { Field, ObjectType } from '@nestjs/graphql';
import Event from '../interfaces/event.interface';
import ChatUpdate from './interfaces/chat-update.interface';

@ObjectType({
  implements: () => ChatUpdate,
})
export default class ChatNameUpdate implements ChatUpdate {
  @Field()
  nameBefore: string;

  @Field()
  nameAfter: string;

  event: Event;
  eventId: number;
}
