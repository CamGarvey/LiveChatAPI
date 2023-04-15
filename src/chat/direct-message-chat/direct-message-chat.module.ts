import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';
import { ChatModule } from '../chat.module';
import { DirectMessageChatResolver } from './resolvers/direct-message-chat.resolver';
import { DirectMessageChatService } from './services/direct-message-chat.service';

@Module({
  providers: [DirectMessageChatResolver, DirectMessageChatService],
  imports: [forwardRef(() => ChatModule), PrismaModule, PubSubModule],
})
export class DirectMessageChatModule {}
