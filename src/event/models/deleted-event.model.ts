import { Field, ObjectType } from '@nestjs/graphql';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import User from 'src/user/models/interfaces/user.interface';
import Event from './interfaces/event.interface';

@ObjectType({
  implements: () => Event,
})
export default class DeletedEvent implements Event {
  @Field(() => Date)
  deletedAt: Date;

  id: number;
  chatId: number;
  chat: Chat;
  createdById: number;
  isCreator: boolean;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}
