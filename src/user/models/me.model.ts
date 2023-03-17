import { ObjectType } from '@nestjs/graphql';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import KnownUser from 'src/user/models/interfaces/known-user.interface';
import User from 'src/user/models/interfaces/user.interface';

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
