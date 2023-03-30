import { Field, InputType } from '@nestjs/graphql';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';

@InputType()
export class DescriptionUpdateInput {
  @Field(() => HashIdScalar)
  chatId: number;

  @Field({
    description: 'New name for chat',
  })
  description: string;
}
