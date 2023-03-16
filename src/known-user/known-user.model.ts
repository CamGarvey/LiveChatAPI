import { Field, ID, InterfaceType } from '@nestjs/graphql';
import Chat from 'src/chat/chat.model';

@InterfaceType()
export default abstract class KnownUser {
  @Field(() => [Chat])
  chats: Chat[];
}
