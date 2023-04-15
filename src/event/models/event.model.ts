import { Field, ObjectType } from '@nestjs/graphql';
import Chat from 'src/chat/chat.interface';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import User from 'src/user/models/interfaces/user.interface';
import { PayloadUnion } from '../payload/models/payload.union';

@ObjectType()
export default class Event {
  @Field(() => HashIdScalar)
  id: number;

  @Field(() => PayloadUnion)
  payload: typeof PayloadUnion;

  @Field(() => HashIdScalar)
  chatId: number;

  @Field(() => Chat)
  chat: Chat;

  @Field(() => HashIdScalar)
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
