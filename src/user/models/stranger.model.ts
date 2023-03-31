import { Field, ObjectType } from '@nestjs/graphql';
import { FriendRequest } from 'src/request/friend-request/models/friend-request.model';
import User from './interfaces/user.interface';
import Friend from './friend.model';

@ObjectType({
  implements: () => [User],
})
export default class Stranger implements User {
  @Field(() => FriendRequest, { nullable: true })
  friendRequest?: FriendRequest;

  @Field(() => [Friend])
  mutualFriends: Friend;

  id: number;
  username: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
