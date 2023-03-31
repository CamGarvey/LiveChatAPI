import { Field, ObjectType } from '@nestjs/graphql';
import User from 'src/user/models/interfaces/user.interface';

@ObjectType()
export default class Message {
  @Field()
  content: string;

  @Field(() => [User])
  likedBy: User[];
}
