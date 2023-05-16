import { Field, ObjectType } from '@nestjs/graphql';
import Chat from 'src/chat/chat.interface';
import Member from 'src/member/models/interfaces/member.interface';
import User from 'src/user/models/interfaces/user.interface';

@ObjectType({
  implements: () => Chat,
})
export class DirectMessageChat implements Chat {
  @Field(() => Member)
  recipient: Member;

  id: number;
  createdBy: User;
  createdById: number;
  isCreator: boolean;
  createdAt: Date;
  updatedAt: Date;
}
