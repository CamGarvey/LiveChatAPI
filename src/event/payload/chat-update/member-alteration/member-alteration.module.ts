import { Module, forwardRef } from '@nestjs/common';
import { MemberAlterationResolver } from './resolvers/chat-member-alteration.resolver';
import { ChatUpdateModule } from '../chat-update.module';

@Module({
  providers: [MemberAlterationResolver],
  imports: [forwardRef(() => ChatUpdateModule)],
})
export class MemberAlterationModule {}
