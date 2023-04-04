import { ObjectType } from '@nestjs/graphql';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import User from './interfaces/user.interface';
import { PaginatedUser } from '../resolvers/user.resolver';

@ObjectType({
  implements: () => [User],
})
export default class Friend implements User {
  id: number;
  username: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  chats: Chat[];
  friends: PaginatedUser;
}
