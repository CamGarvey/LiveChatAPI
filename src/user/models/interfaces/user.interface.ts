import { Field, InterfaceType } from '@nestjs/graphql';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import Friend from '../friend.model';
import { IContext } from 'src/auth/interfaces/context.interface';
import Me from 'src/user/me/models/me.model';
import Stranger from '../stranger.model';

@InterfaceType({
  resolveType: (value: User, { user }: IContext) => {
    if (value.id == user.id) {
      return Me;
    }
    if (user.friendIds.includes(value.id)) {
      return Friend;
    }
    return Stranger;
  },
})
export default class User {
  @Field(() => HashIdScalar)
  id: number;

  @Field(() => String)
  username: string;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
