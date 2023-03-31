import { Module } from '@nestjs/common';
import { GroupChatResolver } from './resolvers/group-chat.resolver';

@Module({
  providers: [GroupChatResolver],
})
export class GroupChatModule {}
