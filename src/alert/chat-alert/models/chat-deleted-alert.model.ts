import { Field, ObjectType } from '@nestjs/graphql';
import { AlertType } from '@prisma/client';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import User from 'src/user/models/interfaces/user.interface';
import Alert from '../../models/interfaces/alert.interface';

@ObjectType({
  implements: () => [Alert],
})
export default class ChatDeletedAlert implements Alert {
  @Field(() => HashIdScalar)
  chatId: number;

  @Field(() => User)
  chat: User;

  id: number;
  createdBy: User;
  createdById: number;
  isCreator: boolean;
  recipients: User[];
  createdAt: Date;
}
