import { Field, ObjectType } from '@nestjs/graphql';
import Member from 'src/member/models/interfaces/member.interface';
import { MemberRole } from 'src/member/models/member-role.enum';
import Event from '../interfaces/event.interface';
import ChatMemberAlteration from './interfaces/chat-member-alteration.interface';

@ObjectType({
  implements: () => ChatMemberAlteration,
})
export default class ChatMembersRoleChanged implements ChatMemberAlteration {
  @Field(() => MemberRole)
  role: MemberRole;
  members: Member[];
  event: Event;
  eventId: number;
}
