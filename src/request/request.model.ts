import { Field, ID, InterfaceType, registerEnumType } from '@nestjs/graphql';
import Notification from 'src/notification/notification.model';
import User from '../user/user.model';

@InterfaceType()
export default abstract class Request extends Notification {
  @Field(() => User)
  recipient: User;

  @Field(() => ID)
  recipientId: number;

  @Field(() => RequestState)
  state: RequestState;
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
