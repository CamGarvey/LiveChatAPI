import { createUnionType } from '@nestjs/graphql';
import ChatDescriptionUpdate from './payloads/chat-description-update.model';
import ChatMembersAddedUpdate from './payloads/chat-members-added-update.model';
import ChatMembersRemovedUpdate from './payloads/chat-members-removed-update.model';
import Message from './payloads/message.model';

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
