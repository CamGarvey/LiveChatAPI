import { Field, ObjectType } from '@nestjs/graphql';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import User from 'src/user/models/interfaces/user.interface';
import ChatUpdateEvent from './interfaces/chat-update-event.interface';
import Event from './interfaces/event.interface';

@ObjectType({
  implements: () => Event,
})
export default class ChatNameUpdateEvent implements ChatUpdateEvent {
  @Field()
  nameBefore: string;

  @Field()
  nameAfter: string;

  id: number;
  chatId: number;
  chat: Chat;
  createdById: number;
  isCreator: boolean;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}
