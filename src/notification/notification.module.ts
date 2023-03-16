import { Module } from '@nestjs/common';
import { NotificationInterfaceResolver } from './notification.resolver';

@Module({
  providers: [NotificationInterfaceResolver],
})
export class NotificationModule {}
