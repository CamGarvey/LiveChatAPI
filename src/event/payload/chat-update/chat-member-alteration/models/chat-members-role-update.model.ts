import { Field, ObjectType } from '@nestjs/graphql';
import Event from 'src/event/models/interfaces/event.interface';
import { MemberRole } from 'src/member/models/member-role.enum';
import ChatMemberAlteration from './interface/chat-member-alteration.interface';
import Member from 'src/member/models/interfaces/member.interface';
import ChatUpdate from '../../models/interface/chat-update.interface';

@ObjectType({
  implements: () => [ChatUpdate, ChatMemberAlteration],
})
export default class ChatMembersRoleUpdate implements ChatMemberAlteration {
  @Field(() => MemberRole)
  role: MemberRole;

  members: Member[];
  event: Event;
  eventId: number;
}
