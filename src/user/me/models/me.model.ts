import { Field, ObjectType } from '@nestjs/graphql';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import User from 'src/user/models/interfaces/user.interface';
import { PaginatedUser } from 'src/user/resolvers/user.resolver';

@ObjectType({
  implements: () => [User],
})
export default class Me implements User {
  @Field(() => [Chat])
  chats: Chat[];

  id: number;
  username: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  friends: PaginatedUser;
}
