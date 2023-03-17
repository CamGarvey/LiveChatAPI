import { Module } from '@nestjs/common';
import { ChatModule } from 'src/chat/chat.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { AlertService } from './alert.service';
import { AlertInterfaceResolver } from './resolvers/alert.resolver';
import { ChatAlertInterfaceResolver } from './resolvers/chat-alert.resolver';

@Module({
  providers: [AlertService, AlertInterfaceResolver, ChatAlertInterfaceResolver],
  imports: [PrismaModule, ChatModule, UserModule],
})
export class AlertModule {}
