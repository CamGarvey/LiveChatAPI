import { Module } from '@nestjs/common';
import { MemberModule } from 'src/member/member.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';
import { UserModule } from 'src/user/user.module';
import { ChatService } from './chat.service';
import { ChatInterfaceResolver } from './resolvers/chat.resolver';
import { GroupChatResolver } from './resolvers/group-chat-resolver';

@Module({
  providers: [ChatService, ChatInterfaceResolver, GroupChatResolver],
  imports: [PrismaModule, UserModule, MemberModule, ChatModule, PubSubModule],
  exports: [ChatService],
})
export class ChatModule {}
