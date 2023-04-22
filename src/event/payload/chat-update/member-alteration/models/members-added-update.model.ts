import { ObjectType } from '@nestjs/graphql';
import Event from 'src/event/models/interfaces/event.interface';
import Member from 'src/member/models/interfaces/member.interface';
import MemberAlteration from './interface/member-alteration.interface';
import ChatUpdate from '../../models/interface/chat-update.interface';

@ObjectType({
  implements: () => [ChatUpdate, MemberAlteration],
})
export default class MembersAddedUpdate implements MemberAlteration {
  members: Member[];
  event: Event;
  eventId: number;
}
