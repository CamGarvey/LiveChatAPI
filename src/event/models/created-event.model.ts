import { Field, ObjectType } from '@nestjs/graphql';
import { EventType } from '@prisma/client';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import User from 'src/user/models/interfaces/user.interface';
import Event from './interfaces/event.interface';
import { PayloadUnion } from './payload.union';

@ObjectType({
  implements: () => Event,
})
export default class CreatedEvent implements Event {
  @Field(() => PayloadUnion)
  payload: typeof PayloadUnion;

  id: number;
  chatId: number;
  chat: Chat;
  createdById: number;
  isCreator: boolean;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
  type: EventType;
}
