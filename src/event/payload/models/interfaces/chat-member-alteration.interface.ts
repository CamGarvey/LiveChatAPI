import { Field, InterfaceType } from '@nestjs/graphql';
import Event from 'src/event/models/interfaces/event.interface';
import Member from 'src/member/models/interfaces/member.interface';
import ChatUpdate from './chat-update.interface';

@InterfaceType()
export default class ChatMemberAlteration implements ChatUpdate {
  @Field(() => [Member])
  members: Member[];

  event: Event;
  eventId: number;
}
