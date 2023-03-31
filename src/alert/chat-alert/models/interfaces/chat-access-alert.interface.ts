import { Field, ID, InterfaceType } from '@nestjs/graphql';
import { Alert as PrimsaAlert, AlertType } from '@prisma/client';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import Request from 'src/request/models/interfaces/request.interface';
import User from 'src/user/models/interfaces/user.interface';
import Alert from '../../../models/interfaces/alert.interface';
import ChatAlert from './chat-alert.interface';

@InterfaceType({
  implements: () => [ChatAlert, Alert],
  resolveType: (source: PrimsaAlert) => {
    return source.type;
  },
})
export default class ChatAccessAlert implements ChatAlert {
  id: number;
  createdBy: User;
  createdById: number;
  isCreator: boolean;
  recipient: User;
  recipientId: number;
  createdAt: Date;
  chatId: number;
  chat: Chat;
}
