import { Module, forwardRef } from '@nestjs/common';
import { ChatMemberAlterationResolver } from './resolvers/chat-member-alteration.resolver';
import { EventModule } from 'src/event/event.module';

@Module({
  providers: [ChatMemberAlterationResolver],
  imports: [forwardRef(() => EventModule)],
})
export class ChatMemberAlterationModule {}
