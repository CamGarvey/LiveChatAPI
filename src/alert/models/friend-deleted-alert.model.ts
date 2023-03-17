import { Field, ObjectType } from '@nestjs/graphql';
import { AlertType } from '@prisma/client';
import User from 'src/user/models/interfaces/user.interface';
import Alert from './interfaces/alert.interface';

@ObjectType({
  implements: () => [Alert],
})
export default class FriendDeletedAlert implements Alert {
  @Field()
  userId: number;

  @Field(() => User)
  user: User;

  id: number;
  createdBy: User;
  createdById: number;
  isCreator: boolean;
  recipient: User;
  recipientId: number;
  createdAt: Date;
}
