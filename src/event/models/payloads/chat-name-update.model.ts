import { Field, ObjectType } from '@nestjs/graphql';
import ChatUpdate from './interfaces/chat-update.interface';

@ObjectType({
  implements: () => ChatUpdate,
})
export default class ChatNameUpdate implements ChatUpdate {
  @Field()
  nameBefore: string;

  @Field()
  nameAfter: string;
}
