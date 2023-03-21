import { Field, InterfaceType } from '@nestjs/graphql';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import User from 'src/user/models/interfaces/user.interface';
import { MemberRole } from '../member-role.enum';

@InterfaceType()
export default class Member {
  @Field(() => MemberRole)
  role: MemberRole;

  @Field(() => User)
  user: User;

  @Field()
  userId: number;

  @Field(() => Chat)
  chat: Chat;

  @Field()
  chatId: number;

  @Field(() => User)
  addedBy: User;

  @Field()
  addedById: number;
}
