import { Module } from '@nestjs/common';
import { MemberModule } from 'src/member/member.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';
import { UserModule } from 'src/user/user.module';
import { ChatService } from './chat.service';
import { ChatInterfaceResolver } from './resolvers/chat.resolver';
import { GroupChatModule } from './group-chat/group-chat.module';
import { DirectMessageChatModule } from './direct-message-chat/direct-message-chat.module';
import { ForbiddenChatModule } from './forbidden-chat/forbidden-chat.module';

@Module({
  providers: [ChatService, ChatInterfaceResolver],
  imports: [
    PrismaModule,
    UserModule,
    MemberModule,
    ChatModule,
    GroupChatModule,
    DirectMessageChatModule,
    PubSubModule,
    ForbiddenChatModule,
  ],
  exports: [ChatService],
})
export class ChatModule {}
