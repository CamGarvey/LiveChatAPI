import { createUnionType } from '@nestjs/graphql';
import ChatDescriptionUpdate from '../chat-update/models/interface/chat-description-update.model';

import Message from '../message/models/message.model';
import ChatMembersAddedUpdate from '../chat-update/chat-member-alteration/models/chat-members-added-update.model';
import ChatMembersRemovedUpdate from '../chat-update/chat-member-alteration/models/chat-members-removed-update.model';

export const PayloadUnion = createUnionType({
  name: 'PayloadUnion',
  types: () =>
    [
      Message,
      ChatDescriptionUpdate,
      ChatMembersAddedUpdate,
      ChatMembersRemovedUpdate,
    ] as const,
});
