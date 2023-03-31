import { ObjectType } from '@nestjs/graphql';
import Event from 'src/event/models/interfaces/event.interface';
import Member from 'src/member/models/interfaces/member.interface';
import ChatMemberAlteration from './interfaces/chat-member-alteration.interface';

@ObjectType({
  implements: () => ChatMemberAlteration,
})
export default class ChatMembersAddedUpdate implements ChatMemberAlteration {
  members: Member[];

  event: Event;
  eventId: number;
}
