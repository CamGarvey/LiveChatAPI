import { Module, forwardRef } from '@nestjs/common';
import { ChatAlertInterfaceResolver } from './resolvers/chat-alert.resolver';
import { AlertModule } from '../alert.module';
import { ChatModule } from 'src/chat/chat.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';

@Module({
  providers: [ChatAlertInterfaceResolver],
  imports: [forwardRef(() => AlertModule), ChatModule, PubSubModule],
})
export class ChatAlertModule {}
