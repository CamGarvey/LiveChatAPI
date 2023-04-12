import { Module } from '@nestjs/common';
import { ChatModule } from 'src/chat/chat.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';
import { UserModule } from 'src/user/user.module';
import { AlertService } from './services/alert.service';
import { AlertInterfaceResolver } from './resolvers/alert.resolver';
import { ChatAlertModule } from './chat-alert/chat-alert.module';

@Module({
  providers: [AlertService, AlertInterfaceResolver],
  imports: [PrismaModule, UserModule, PubSubModule, ChatAlertModule],
  exports: [AlertService],
})
export class AlertModule {}
