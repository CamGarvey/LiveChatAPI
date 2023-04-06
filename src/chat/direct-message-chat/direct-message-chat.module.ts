import { Module, forwardRef } from '@nestjs/common';
import { DirectMessageChatResolver } from './resolvers/direct-message-chat.resolver';
import { ChatModule } from '../chat.module';
import { MemberModule } from 'src/member/member.module';
import { DirectMessageChatService } from './services/direct-message-chat.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';

@Module({
  providers: [DirectMessageChatResolver, DirectMessageChatService],
  imports: [forwardRef(() => ChatModule), PrismaModule, PubSubModule],
})
export class DirectMessageChatModule {}
