import { Field, ID, InterfaceType } from '@nestjs/graphql';
import User from 'src/user/models/interfaces/user.interface';

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
