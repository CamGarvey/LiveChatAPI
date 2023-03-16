import { Resolver } from '@nestjs/graphql';
import Notification from './notification.model';

@Resolver((type) => Notification)
export class NotificationInterfaceResolver {}
