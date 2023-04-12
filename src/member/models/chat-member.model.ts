import { ObjectType } from '@nestjs/graphql';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import User from 'src/user/models/interfaces/user.interface';
import Member from './interfaces/member.interface';
import { Role } from '@prisma/client';

@ObjectType({
  implements: () => [Member],
})
export default class ChatMember implements Member {
  id: number;
  role: Role;
  user: User;
  userId: number;
  chat: Chat;
  chatId: number;
  addedBy: User;
  addedById: number;
}
