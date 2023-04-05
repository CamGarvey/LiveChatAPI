import { Module, forwardRef } from '@nestjs/common';
import { ChatMemberAlterationResolver } from './resolvers/chat-member-alteration.resolver';
import { ChatUpdateModule } from '../chat-update.module';

@Module({
  providers: [ChatMemberAlterationResolver],
  imports: [forwardRef(() => ChatUpdateModule)],
})
export class ChatMemberAlterationModule {}
