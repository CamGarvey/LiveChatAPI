import { Field, ObjectType } from '@nestjs/graphql';
import Event from '../interfaces/event.interface';
import ChatUpdate from './interfaces/chat-update.interface';

@ObjectType({
  implements: () => ChatUpdate,
})
export default class ChatDescriptionUpdate implements ChatUpdate {
  @Field()
  descriptionBefore: string;

  @Field()
  descriptionAfter: string;

  event: Event;
  eventId: number;
}
