import { createUnionType } from '@nestjs/graphql';
import ChatDescriptionUpdate from './chat-description-update.model';
import ChatMembersAddedUpdate from './chat-members-added-update.model';
import ChatMembersRemovedUpdate from './chat-members-removed-update.model';
import Message from './message.model';

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
