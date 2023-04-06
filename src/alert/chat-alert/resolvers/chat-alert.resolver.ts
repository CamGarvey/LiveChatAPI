import { Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { IContext } from 'src/auth/interfaces/context.interface';
import { ChatService } from 'src/chat/chat.service';
import { NotificationPayload } from 'src/common/subscriptions/subscription.model';
import { PubSubService } from 'src/pubsub/pubsub.service';
import ChatAlert from '../models/interfaces/chat-alert.interface';
import { AlertService } from 'src/alert/services/alert.service';

@Resolver(() => ChatAlert)
export class ChatAlertInterfaceResolver {
  constructor(
    private readonly alertService: AlertService,
    private readonly pubsub: PubSubService,
  ) {}

  @ResolveField()
  async chat(@Parent() parent: ChatAlert) {
    return await this.alertService.getAlert(parent.id).chat();
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
