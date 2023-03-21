import { Field, InterfaceType } from '@nestjs/graphql';
import Event from '../../interfaces/event.interface';

@InterfaceType()
export default class ChatUpdate {
  @Field(() => Event)
  event: Event;

  @Field()
  eventId: number;
}
