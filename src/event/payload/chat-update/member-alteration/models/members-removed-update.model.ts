import { ObjectType } from '@nestjs/graphql';
import Event from 'src/event/models/interfaces/event.interface';
import MemberAlteration from './interface/member-alteration.interface';
import Member from 'src/member/models/interfaces/member.interface';
import ChatUpdate from '../../models/interface/chat-update.interface';

@ObjectType({
  implements: () => [ChatUpdate, MemberAlteration],
})
export default class MembersRemovedUpdate implements MemberAlteration {
  members: Member[];
  event: Event;
  eventId: number;
}
