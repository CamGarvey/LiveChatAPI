import { Field, InterfaceType, registerEnumType } from '@nestjs/graphql';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import User from '../../../user/models/interfaces/user.interface';
import { RequestState } from '@prisma/client';
import { FriendRequest } from 'src/request/friend-request/models/friend-request.model';

@InterfaceType({
  resolveType: () => FriendRequest,
})
export default class Request {
  @Field(() => HashIdScalar)
  id: number;

  @Field(() => User)
  createdBy: User;

  @Field(() => HashIdScalar)
  createdById: number;

  @Field()
  isCreator: boolean;

  @Field(() => User)
  recipient: User;

  @Field(() => HashIdScalar)
  recipientId: number;

  @Field(() => RequestState)
  state: RequestState;

  @Field(() => Date)
  createdAt: Date;
}

registerEnumType(RequestState, {
  name: 'RequestState',
});
