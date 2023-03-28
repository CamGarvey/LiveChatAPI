import { Field, InputType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import { MemberRole } from '../member-role.enum';

@InputType()
export class ChangeRoleInput {
  @Field()
  chatId: number;

  @Field(() => [HashIdScalar])
  userIds: number[];

  @Field(() => MemberRole, {
    description: 'New role for members',
  })
  role: Role;
}
