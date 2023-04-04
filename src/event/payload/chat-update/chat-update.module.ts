import { Module, forwardRef } from '@nestjs/common';
import { ChatUpdateInterfaceResolver } from './resolvers/chat-update.resolver';
import { EventModule } from 'src/event/event.module';
import { ChatMemberAlterationModule } from './chat-member-alteration/chat-member-alteration.module';

@Module({
  providers: [ChatUpdateInterfaceResolver],
  imports: [ChatMemberAlterationModule, forwardRef(() => EventModule)],
})
export class ChatUpdateModule {}
