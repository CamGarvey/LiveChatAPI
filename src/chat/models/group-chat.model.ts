import { Field, ObjectType } from '@nestjs/graphql';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import { MemberRole } from 'src/member/models/member-role.enum';
import { PaginatedMember } from 'src/member/models/paginated-member.model';
import User from 'src/user/models/interfaces/user.interface';

@ObjectType({
  implements: () => Chat,
})
export default class GroupChat implements Chat {
  @Field(() => MemberRole)
  role: MemberRole;

  @Field()
  name: string;

  @Field()
  description?: string;

  @Field(() => PaginatedMember)
  members: PaginatedMember;

  id: number;
  createdBy: User;
  createdById: number;
  isCreator: boolean;
  createdAt: Date;
  updatedAt: Date;
}
