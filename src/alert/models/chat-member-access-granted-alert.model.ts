import { ObjectType } from '@nestjs/graphql';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import User from 'src/user/models/interfaces/user.interface';
import ChatAccessAlert from './interfaces/chat-access-alert.interface';

@ObjectType({
  implements: () => [ChatAccessAlert],
})
export default class ChatMemberAccessGrantedAlert implements ChatAccessAlert {
  chatId: number;
  chat: Chat;
  id: number;
  createdBy: User;
  createdById: number;
  isCreator: boolean;
  recipient: User;
  recipientId: number;
  createdAt: Date;
}
