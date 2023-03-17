import { Field, ID, InterfaceType } from '@nestjs/graphql';
import Friend from '../friend.model';

@InterfaceType({
  resolveType: () => {
    return Friend;
  },
})
export default class User {
  @Field(() => ID)
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
