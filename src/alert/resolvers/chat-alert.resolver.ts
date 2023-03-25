import {
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { AlertService } from 'src/alert/alert.service';
import { IContext } from 'src/auth/interfaces/context.interface';
import { ChatService } from 'src/chat/chat.service';
import { NotificationPayload } from 'src/common/subscriptions/subscription.model';
import { PubSubService } from 'src/pubsub/pubsub.service';
import ChatAlert from '../models/interfaces/chat-alert.interface';

@Resolver(() => ChatAlert)
export class ChatAlertInterfaceResolver {
  constructor(
    private readonly chatService: ChatService,
    private readonly pubsub: PubSubService,
  ) {}

  @ResolveField()
  async chat(@Parent() parent: ChatAlert) {
    return this.chatService.getChat(parent.chatId);
  }

  @Subscription(() => ChatAlert, {
    name: 'alerts',
    filter(payload: NotificationPayload, _, { user }: IContext) {
      return payload.recipients.includes(user.id);
    },
  })
  async chatAlerts() {
    return this.pubsub.asyncIterator('notification.alert.chat.*', {
      pattern: true,
    });
  }
}
