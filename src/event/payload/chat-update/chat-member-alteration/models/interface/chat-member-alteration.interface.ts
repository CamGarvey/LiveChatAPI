import { Field, InterfaceType } from '@nestjs/graphql';
import { ChatUpdate as PrismaChatUpdate } from '@prisma/client';
import Event from 'src/event/models/interfaces/event.interface';
import Member from 'src/member/models/interfaces/member.interface';
import ChatMembersAddedUpdate from '../chat-members-added-update.model';
import ChatMembersRemovedUpdate from '../chat-members-removed-update.model';
import ChatMembersRoleUpdate from '../chat-members-role-update.model';
import ChatUpdate from '../../../models/interface/chat-update.interface';

@InterfaceType({
  resolveType: (source: PrismaChatUpdate) => {
    switch (source.type) {
      case 'MEMBERS_ADDED':
        return ChatMembersAddedUpdate;
      case 'MEMBERS_REMOVED':
        return ChatMembersRemovedUpdate;
      case 'ROLE_CHANGED':
        return ChatMembersRoleUpdate;
      default:
        throw new Error('ChatType not supported');
    }
  },
})
export default class ChatMemberAlteration implements ChatUpdate {
  @Field(() => [Member])
  members: Member[];

  event: Event;
  eventId: number;
}
