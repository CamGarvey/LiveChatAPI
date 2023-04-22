import { Field, InterfaceType } from '@nestjs/graphql';
import { ChatUpdate as PrismaChatUpdate } from '@prisma/client';
import Event from 'src/event/models/interfaces/event.interface';
import Member from 'src/member/models/interfaces/member.interface';
import MembersAddedUpdate from '../members-added-update.model';
import MembersRemovedUpdate from '../members-removed-update.model';
import RoleChangedUpdate from '../role-changed-update.model';
import ChatUpdate from '../../../models/interface/chat-update.interface';

@InterfaceType({
  implements: () => ChatUpdate,
  resolveType: (source: PrismaChatUpdate) => {
    switch (source.type) {
      case 'MEMBERS_ADDED':
        return MembersAddedUpdate;
      case 'MEMBERS_REMOVED':
        return MembersRemovedUpdate;
      case 'ROLE_CHANGED':
        return RoleChangedUpdate;
      default:
        throw new Error('ChatType not supported');
    }
  },
})
export default class MemberAlteration implements ChatUpdate {
  @Field(() => [Member])
  members: Member[];

  event: Event;
  eventId: number;
}
