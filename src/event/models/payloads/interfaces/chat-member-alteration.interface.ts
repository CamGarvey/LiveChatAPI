import { Field, InterfaceType } from '@nestjs/graphql';
import Member from 'src/member/models/interfaces/member.interface';
import ChatUpdate from './chat-update.interface';

@InterfaceType()
export default class ChatMemberAlteration implements ChatUpdate {
  @Field(() => [Member])
  members: Member[];
}
