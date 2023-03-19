import { Field, ObjectType } from '@nestjs/graphql';
import ChatUpdate from './interfaces/chat-update.interface';

@ObjectType({
  implements: () => ChatUpdate,
})
export default class ChatDescriptionUpdate implements ChatUpdate {
  @Field()
  descriptionBefore: string;

  @Field()
  descriptionAfter: string;
}
