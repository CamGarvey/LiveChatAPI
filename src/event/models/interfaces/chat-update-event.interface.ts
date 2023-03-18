import { Field, ObjectType } from '@nestjs/graphql';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import User from 'src/user/models/interfaces/user.interface';
import Event from './event.interface';

@ObjectType({
  implements: () => Event,
})
export default abstract class ChatUpdateEvent implements Event {
  id: number;
  chatId: number;
  chat: Chat;
  createdById: number;
  isCreator: boolean;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}
