import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';

@InputType()
export class ChangeRoleInput {
  @Field(() => HashIdScalar)
  chatId: number;

  @Field(() => [HashIdScalar])
  userIds: number[];

  @Field(() => Role, {
    description: 'New role for members',
  })
  role: Role;
}

registerEnumType(Role, {
  name: 'Role',
});
