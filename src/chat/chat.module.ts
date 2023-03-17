import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatService } from './chat.service';

@Module({
  providers: [ChatService],
  imports: [PrismaModule],
  exports: [ChatService],
})
export class ChatModule {}
