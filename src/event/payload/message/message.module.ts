import { Module } from '@nestjs/common';
import { MessageService } from './services/message.service';
import { MessageResolver } from './resolvers/message.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';

@Module({
  providers: [MessageService, MessageResolver],
  imports: [PrismaModule, PubSubModule],
})
export class MessageModule {}
