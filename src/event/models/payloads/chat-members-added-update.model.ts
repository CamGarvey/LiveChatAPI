import { ObjectType } from '@nestjs/graphql';
import ChatMemberAlteration from 'src/event/payload/chat-update/chat-member-alteration/models/interface/chat-member-alteration.interface';
import Member from 'src/member/models/interfaces/member.interface';
import Event from '../interfaces/event.interface';

@ObjectType({
  implements: () => ChatMemberAlteration,
})
export default class ChatMembersAddedUpdate implements ChatMemberAlteration {
  members: Member[];

  event: Event;
  eventId: number;
}
