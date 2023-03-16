import { Field, ID, InterfaceType } from '@nestjs/graphql';
import User from 'src/user/user.model';

@InterfaceType()
export default abstract class Notification {
  @Field(() => ID)
  id: number;

  @Field(() => User)
  createdBy: User;

  @Field(() => ID)
  createdById: number;

  @Field(() => Date)
  createdAt: Date;

  @Field()
  isCreator: boolean;
}
