import { Field, InterfaceType, registerEnumType } from '@nestjs/graphql';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import User from '../../../user/models/interfaces/user.interface';

@InterfaceType()
export default abstract class Request {
  @Field(() => HashIdScalar)
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
