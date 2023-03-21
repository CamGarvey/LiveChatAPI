import { ObjectType } from '@nestjs/graphql';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import User from 'src/user/models/interfaces/user.interface';
import Member from './interfaces/member.interface';
import { MemberRole } from './member-role.enum';

@ObjectType({
  implements: () => [Member],
})
export default class ChatMember implements Member {
  role: MemberRole;
  user: User;
  userId: number;
  chat: Chat;
  chatId: number;
  addedBy: User;
  addedById: number;
}
