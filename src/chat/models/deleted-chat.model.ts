import { Field, ObjectType } from '@nestjs/graphql';
import User from 'src/user/models/interfaces/user.interface';
import Chat from './interfaces/chat.interfaces';

@ObjectType({
  implements: () => Chat,
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
