import { Field, ID, InterfaceType } from '@nestjs/graphql';
import { Event as PrismaEvent } from '@prisma/client';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import User from 'src/user/models/interfaces/user.interface';
import CreatedEvent from '../created-event.model';
import DeletedEvent from '../deleted-event.model';

@InterfaceType({
  resolveType: (value: PrismaEvent) => {
    if (value.deletedAt) {
      return DeletedEvent;
    }
    return CreatedEvent;
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
