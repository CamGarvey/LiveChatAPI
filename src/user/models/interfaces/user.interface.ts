import { Field, ID, InterfaceType } from '@nestjs/graphql';
import { HashIdScalar as HashId } from 'src/common/scalars/hash-id.scalar';
import Friend from '../friend.model';

@InterfaceType({
  resolveType: () => {
    return Friend;
  },
})
export default class User {
  @Field(() => HashId)
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
