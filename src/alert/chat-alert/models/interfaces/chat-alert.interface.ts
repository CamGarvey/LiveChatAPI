import { Field, InterfaceType } from '@nestjs/graphql';
import Alert from 'src/alert/models/interfaces/alert.interface';
import Chat from 'src/chat/chat.interface';
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
  recipients: User[];
  createdAt: Date;
}
