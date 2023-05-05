import { Field, InputType } from '@nestjs/graphql';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import { ICreateGroupChat } from '../interfaces/create-group-chat.interface';

@InputType()
export class CreateGroupChatInput implements ICreateGroupChat {
  @Field({
    description: 'Name of the group chat',
  })
  name: string;

  @Field({
    description: 'Short description of the group chat',
    nullable: true,
  })
  description?: string;

  @Field(() => [HashIdScalar], {
    description: 'Ids of the users to be added to the group chat',
    nullable: true,
  })
  userIds: number[];
}
