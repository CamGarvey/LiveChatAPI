import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import Event from 'src/event/models/interfaces/event.interface';
import ChatMemberAlteration from './interface/chat-member-alteration.interface';
import Member from 'src/member/models/interfaces/member.interface';
import ChatUpdate from '../../models/interface/chat-update.interface';
import { Role } from '@prisma/client';

@ObjectType({
  implements: () => [ChatUpdate, ChatMemberAlteration],
})
export default class ChatMembersRoleUpdate implements ChatMemberAlteration {
  @Field(() => Role)
  role: Role;

  members: Member[];
  event: Event;
  eventId: number;
}

registerEnumType(Role, {
  name: 'Role',
});
