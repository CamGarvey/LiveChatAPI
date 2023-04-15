import { Field, ObjectType } from '@nestjs/graphql';
import User from 'src/user/models/interfaces/user.interface';
import Chat from '../chat.interface';

@ObjectType({
  implements: () => Chat,
  description: 'A deleted chat',
})
export default class DeletedChat implements Chat {
  @Field(() => Date)
  deletedAt: Date;

  id: number;
  createdBy: User;
  createdById: number;
  isCreator: boolean;
  createdAt: Date;
  updatedAt: Date;
}
