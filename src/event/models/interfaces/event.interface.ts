import { Field, ID, InterfaceType } from '@nestjs/graphql';
import { Event as PrismaEvent } from '@prisma/client';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import User from 'src/user/models/interfaces/user.interface';
import ChatUpdateEvent from './chat-update-event.interface';

@InterfaceType({
  resolveType: (value: PrismaEvent) => {
    switch (value.type) {
      case 'MESSAGE':
        return MessageEvent;
      case 'CHAT_UPDATE':
        return ChatUpdateEvent;
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
}
