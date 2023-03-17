import { Field, ID, InterfaceType, registerEnumType } from '@nestjs/graphql';
import User from '../../../user/models/interfaces/user.interface';

@InterfaceType()
export default abstract class Request {
  @Field(() => ID)
  id: number;

  @Field(() => User)
  createdBy: User;

  @Field()
  createdById: number;

  @Field()
  isCreator: boolean;

  @Field(() => User)
  recipient: User;

  @Field()
  recipientId: number;

  @Field(() => RequestState)
  state: RequestState;

  @Field(() => Date)
  createdAt: Date;
}

export enum RequestState {
  ACCEPTED,
  CANCELLED,
  DECLINED,
  SENT,
}

registerEnumType(RequestState, {
  name: 'RequestState',
});
