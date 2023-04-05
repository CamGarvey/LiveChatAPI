import { ObjectType } from '@nestjs/graphql';
import Event from 'src/event/models/interfaces/event.interface';
import ChatMemberAlteration from './interface/chat-member-alteration.interface';
import Member from 'src/member/models/interfaces/member.interface';

@ObjectType({
  implements: () => ChatMemberAlteration,
})
export default class ChatMembersRemovedUpdate implements ChatMemberAlteration {
  members: Member[];
  event: Event;
  eventId: number;
}