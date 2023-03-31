import { Module } from '@nestjs/common';
import { ChatModule } from 'src/chat/chat.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';
import { UserModule } from 'src/user/user.module';
import { EventService } from './event.service';
import { CreatedEventResolver } from './resolvers/created-event.resolver';
import { EventInterfaceResolver } from './resolvers/event.resolver';
import { PayloadModule } from './payload/payload.module';

@Module({
  providers: [EventService, EventInterfaceResolver, CreatedEventResolver],
  imports: [PrismaModule, PubSubModule, ChatModule, UserModule, PayloadModule],
})
export class EventModule {}
