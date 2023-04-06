import { Module, forwardRef } from '@nestjs/common';
import { ChatAlertInterfaceResolver } from './resolvers/chat-alert.resolver';
import { AlertModule } from '../alert.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';

@Module({
  providers: [ChatAlertInterfaceResolver],
  imports: [forwardRef(() => AlertModule), PubSubModule],
})
export class ChatAlertModule {}
