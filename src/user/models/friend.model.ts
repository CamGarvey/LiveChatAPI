import { ObjectType } from '@nestjs/graphql';
import Chat from 'src/chat/chat.model';
import KnownUser from 'src/user/models/interfaces/known-user.interface';
import User from './interfaces/user.interface';

@ObjectType({
  implements: () => [User, KnownUser],
})
export default class Friend implements User, KnownUser {
  id: number;
  username: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  chats: Chat[];
}
