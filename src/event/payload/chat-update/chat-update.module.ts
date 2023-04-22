import { Module } from '@nestjs/common';
import { ChatUpdateService } from './services/chat-update.service';
import { ChatUpdateInterfaceResolver } from './resolvers/chat-update.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MemberAlterationModule } from './member-alteration/member-alteration.module';

@Module({
  providers: [ChatUpdateInterfaceResolver, ChatUpdateService],
  imports: [MemberAlterationModule, PrismaModule],
  exports: [ChatUpdateService],
})
export class ChatUpdateModule {}
