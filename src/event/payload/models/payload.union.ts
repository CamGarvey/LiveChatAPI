import { createUnionType } from '@nestjs/graphql';

import Message from '../message/models/message.model';
import ChatMembersAddedUpdate from '../chat-update/chat-member-alteration/models/chat-members-added-update.model';
import ChatMembersRemovedUpdate from '../chat-update/chat-member-alteration/models/chat-members-removed-update.model';
import ChatDescriptionUpdate from '../chat-update/models/chat-description-update.model';
import {
  Message as PrismaMessage,
  ChatUpdate as PrismaChatUpdate,
} from '@prisma/client';
import ChatNameUpdate from '../chat-update/models/chat-name-update.model';
import ChatMembersRoleUpdate from '../chat-update/chat-member-alteration/models/chat-members-role-update.model';

export const PayloadUnion = createUnionType({
  name: 'PayloadUnion',
  resolveType: (source: PrismaMessage | PrismaChatUpdate) => {
    console.log(source);

    if ('type' in source) {
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
    }
    return Message;
  },
  types: () =>
    [
      Message,
      ChatNameUpdate,
      ChatDescriptionUpdate,
      ChatMembersAddedUpdate,
      ChatMembersRemovedUpdate,
    ] as const,
});
