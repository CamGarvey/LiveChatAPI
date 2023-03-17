import { Field, ObjectType } from '@nestjs/graphql';
import { FriendRequest } from 'src/request/models/friend-request.model';
import User from './interfaces/user.interface';

@ObjectType({
  implements: () => [User],
})
export default class Stranger implements User {
  @Field(() => FriendRequest, { nullable: true })
  friendRequest?: FriendRequest;

  id: number;
  username: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
