import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import Chat from 'src/chat/chat.interface';
import { PaginatedMember } from 'src/member/models/paginated-member.model';
import User from 'src/user/models/interfaces/user.interface';

@ObjectType({
  implements: () => Chat,
})
export default class GroupChat implements Chat {
  @Field(() => Role)
  role: Role;

  @Field()
  name: string;

  @Field({
    nullable: true,
  })
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

registerEnumType(Role, {
  name: 'Role',
});
