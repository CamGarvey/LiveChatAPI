import { Field, ID, InterfaceType } from '@nestjs/graphql';
import User from 'src/user/user.model';

@InterfaceType()
export default abstract class Chat {
  @Field(() => ID)
  id: number;

  @Field(() => User)
  createdBy: User;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
