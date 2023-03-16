import { ObjectType } from '@nestjs/graphql';
import Chat from 'src/chat/chat.model';
import KnownUser from 'src/known-user/known-user.model';
import User from 'src/user/user.model';

@ObjectType({
  implements: () => [User, KnownUser],
})
export default class Me implements User, KnownUser {
  id: number;
  username: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  chats: Chat[];
}
