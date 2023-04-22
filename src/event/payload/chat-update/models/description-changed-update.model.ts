import { Field, ObjectType } from '@nestjs/graphql';
import Event from '../../../models/interfaces/event.interface';
import ChatUpdate from './interface/chat-update.interface';

@ObjectType({
  implements: () => ChatUpdate,
})
export default class DescriptionChangedUpdate implements ChatUpdate {
  @Field()
  descriptionBefore: string;

  @Field()
  descriptionAfter: string;

  event: Event;
  eventId: number;
}
