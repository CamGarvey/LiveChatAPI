import { ObjectType } from '@nestjs/graphql';
import Chat from 'src/chat/chat.interface';
import User from '../../models/interfaces/user.interface';
import { PaginatedUser } from 'src/user/models/paginated-user.model';

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
