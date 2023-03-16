import { Field, ID, InterfaceType } from '@nestjs/graphql';

@InterfaceType()
export default abstract class User {
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
