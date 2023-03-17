import { Field, ID, InterfaceType } from '@nestjs/graphql';

@InterfaceType()
export default class Event {
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
