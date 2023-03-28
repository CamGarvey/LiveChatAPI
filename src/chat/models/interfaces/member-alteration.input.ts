import { Field, InputType } from '@nestjs/graphql';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';

@InputType()
export class MemberAlterationInput {
  @Field()
  chatId: number;

  @Field(() => [HashIdScalar])
  userIds: number[];
}
