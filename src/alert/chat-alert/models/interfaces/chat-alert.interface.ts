import { Field, InterfaceType } from '@nestjs/graphql';
import Alert from 'src/alert/models/interfaces/alert.interface';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import User from 'src/user/models/interfaces/user.interface';

@InterfaceType({
  implements: () => Alert,
})
export default class ChatAlert implements Alert {
  @Field(() => HashIdScalar)
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