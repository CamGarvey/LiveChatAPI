import { Field, ID, InterfaceType } from '@nestjs/graphql';
import Chat from 'src/chat/models/interfaces/chat.interfaces';

@InterfaceType()
export default abstract class KnownUser {
  @Field(() => [Chat])
  chats: Chat[];
}
