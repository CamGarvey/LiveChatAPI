import { Field, InterfaceType } from '@nestjs/graphql';
import Event from '../../../../models/interfaces/event.interface';
import { ChatUpdate as PrismaChatUpdate } from '@prisma/client';
import NameChangedUpdate from '../name-changed-update.model';
import ChatDescriptionUpdate from '../description-changed-update.model';
import MembersAddedUpdate from '../../member-alteration/models/members-added-update.model';
import MembersRemovedUpdate from '../../member-alteration/models/members-removed-update.model';
import RoleChangedUpdate from '../../member-alteration/models/role-changed-update.model';

@InterfaceType({
  resolveType: (source: PrismaChatUpdate) => {
    switch (source.type) {
      case 'NAME_CHANGED':
        return NameChangedUpdate;
      case 'DESCRIPTION_CHANGED':
        return ChatDescriptionUpdate;
      case 'MEMBERS_ADDED':
        return MembersAddedUpdate;
      case 'MEMBERS_REMOVED':
        return MembersRemovedUpdate;
      case 'ROLE_CHANGED':
        return RoleChangedUpdate;
    }
  },
})
export default class ChatUpdate {
  @Field(() => Event)
  event: Event;

  @Field()
  eventId: number;
}
