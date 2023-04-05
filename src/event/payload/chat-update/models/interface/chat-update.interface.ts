import { Field, InterfaceType } from '@nestjs/graphql';
import Event from '../../../../models/interfaces/event.interface';
import { ChatUpdate as PrismaChatUpdate } from '@prisma/client';
import ChatMembersAddedUpdate from '../../chat-member-alteration/models/chat-members-added-update.model';
import ChatMembersRemovedUpdate from '../../chat-member-alteration/models/chat-members-removed-update.model';
import ChatNameUpdate from '../chat-name-update.model';
import ChatDescriptionUpdate from '../chat-description-update.model';
import ChatMembersRoleUpdate from '../../chat-member-alteration/models/chat-members-role-update.model';

@InterfaceType({
  resolveType: (source: PrismaChatUpdate) => {
    switch (source.type) {
      case 'NAME_UPDATED':
        return ChatNameUpdate;
      case 'DESCRIPTION_UPDATED':
        return ChatDescriptionUpdate;
      case 'MEMBERS_ADDED':
        return ChatMembersAddedUpdate;
      case 'MEMBERS_REMOVED':
        return ChatMembersRemovedUpdate;
      case 'ROLE_CHANGED':
        return ChatMembersRoleUpdate;
    }
  },
})
export default class ChatUpdate {
  @Field(() => Event)
  event: Event;

  @Field()
  eventId: number;
}
