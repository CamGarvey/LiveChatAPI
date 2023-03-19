import { createUnionType } from '@nestjs/graphql';
import ChatDescriptionUpdate from './payloads/chat-description-update.model';
import ChatNameUpdate from './payloads/chat-name-update.model';
import Message from './payloads/message.model';

export const PayloadUnion = createUnionType({
  name: 'PayloadUnion',
  types: () => [Message, ChatNameUpdate, ChatDescriptionUpdate] as const,
});
