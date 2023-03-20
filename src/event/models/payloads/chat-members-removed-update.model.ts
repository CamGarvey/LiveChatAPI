import { ObjectType } from '@nestjs/graphql';
import Member from 'src/member/models/interfaces/member.interface';
import ChatMemberAlteration from './interfaces/chat-member-alteration.interface';

@ObjectType({
  implements: () => ChatMemberAlteration,
})
export default class ChatMembersRemovedUpdate implements ChatMemberAlteration {
  members: Member[];
}
