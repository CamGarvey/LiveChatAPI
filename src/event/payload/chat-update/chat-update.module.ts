import { Module } from '@nestjs/common';
import { ChatMemberAlterationModule } from './chat-member-alteration/chat-member-alteration.module';
import { ChatUpdateService } from './services/chat-update.service';
import { ChatUpdateInterfaceResolver } from './resolvers/chat-update.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [ChatUpdateInterfaceResolver, ChatUpdateService],
  imports: [ChatMemberAlterationModule, PrismaModule],
  exports: [ChatUpdateService],
})
export class ChatUpdateModule {}
