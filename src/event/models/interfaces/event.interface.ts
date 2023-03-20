import { Field, ID, InterfaceType } from '@nestjs/graphql';
import { Event as PrismaEvent, EventType } from '@prisma/client';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import User from 'src/user/models/interfaces/user.interface';
import ChatUpdate from '../payloads/interfaces/chat-update.interface';
import Message from '../payloads/message.model';

@InterfaceType({
  resolveType: (value: PrismaEvent) => {
    switch (value.type) {
      case 'MESSAGE':
        return Message;
      case 'CHAT_UPDATE':
        return ChatUpdate;
    }
  },
})
export default class Event {
  @Field(() => ID)
  id: number;

  @Field()
  chatId: number;

  @Field(() => Chat)
  chat: Chat;

  @Field()
  createdById: number;

  @Field()
  isCreator: boolean;

  @Field(() => User)
  createdBy: User;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => EventType)
  type: EventType;
}
