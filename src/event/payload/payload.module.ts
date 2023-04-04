import { Module, forwardRef } from '@nestjs/common';
import { MessageModule } from './message/message.module';
import { ChatUpdateModule } from './chat-update/chat-update.module';
import { EventModule } from '../event.module';

@Module({
  imports: [MessageModule, ChatUpdateModule, forwardRef(() => EventModule)],
})
export class PayloadModule {}
