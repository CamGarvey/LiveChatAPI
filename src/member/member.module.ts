import { Module } from '@nestjs/common';
import { ChatModule } from 'src/chat/chat.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MemberService } from './member.service';

@Module({
  providers: [MemberService],
  imports: [PrismaModule, ChatModule],
})
export class MemberModule {}
