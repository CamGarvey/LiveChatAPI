import { Field, ID, InterfaceType } from '@nestjs/graphql';
import { Alert as PrimsaAlert, AlertType } from '@prisma/client';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import Request from 'src/request/models/interfaces/request.interface';
import User from 'src/user/models/interfaces/user.interface';
import Alert from './alert.interface';

@InterfaceType({
  implements: () => Alert,
})
export default class ChatAlert implements Alert {
  @Field()
  chatId: number;

  @Field(() => Chat)
  chat: Chat;

  id: number;
  createdBy: User;
  createdById: number;
  isCreator: boolean;
  recipient: User;
  recipientId: number;
  createdAt: Date;
}
