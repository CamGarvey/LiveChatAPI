import { ObjectType } from '@nestjs/graphql';
import Alert from 'src/alert/models/interfaces/alert.interface';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import User from 'src/user/models/interfaces/user.interface';
import ChatAccessAlert from './interfaces/chat-access-alert.interface';
import ChatAlert from './interfaces/chat-alert.interface';

@ObjectType({
  implements: () => [ChatAccessAlert, ChatAlert, Alert],
})
export default class ChatMemberAccessGrantedAlert implements ChatAccessAlert {
  chatId: number;
  chat: Chat;
  id: number;
  createdBy: User;
  createdById: number;
  isCreator: boolean;
  recipients: User[];
  createdAt: Date;
}
