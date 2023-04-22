import { createUnionType } from '@nestjs/graphql';

import Message from '../message/models/message.model';
import ChatDescriptionUpdate from '../chat-update/models/description-changed-update.model';
import {
  Message as PrismaMessage,
  ChatUpdate as PrismaChatUpdate,
} from '@prisma/client';
import NameChangedUpdate from '../chat-update/models/name-changed-update.model';
import MembersRemovedUpdate from '../chat-update/member-alteration/models/members-removed-update.model';
import RoleChangedUpdate from '../chat-update/member-alteration/models/role-changed-update.model';
import MembersAddedUpdate from '../chat-update/member-alteration/models/members-added-update.model';
import DescriptionChangedUpdate from '../chat-update/models/description-changed-update.model';

export const PayloadUnion = createUnionType({
  name: 'PayloadUnion',
  resolveType: (source: PrismaMessage | PrismaChatUpdate) => {
    if ('type' in source) {
      switch (source.type) {
        case 'NAME_CHANGED':
          return NameChangedUpdate;
        case 'DESCRIPTION_CHANGED':
          return DescriptionChangedUpdate;
        case 'MEMBERS_ADDED':
          return MembersAddedUpdate;
        case 'MEMBERS_REMOVED':
          return MembersRemovedUpdate;
        case 'ROLE_CHANGED':
          return RoleChangedUpdate;
      }
    }
    return Message;
  },
  types: () =>
    [
      Message,
      NameChangedUpdate,
      ChatDescriptionUpdate,
      MembersAddedUpdate,
      MembersRemovedUpdate,
    ] as const,
});
