import { Module } from '@nestjs/common';
import { ChatModule } from 'src/chat/chat.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';
import { UserModule } from 'src/user/user.module';
import { EventService } from './event.service';
import { EventResolver } from './resolvers/event.resolver';

@Module({
  providers: [EventService, EventResolver],
  imports: [PrismaModule, PubSubModule, ChatModule, UserModule],
})
export class EventModule {}
