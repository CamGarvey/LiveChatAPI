import {
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { AlertService } from 'src/alert/alert.service';
import { IContext } from 'src/auth/interfaces/context.interface';
import { NotificationPayload } from 'src/common/subscriptions/subscription.model';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { UserService } from 'src/user/user.service';
import Alert from '../models/interfaces/alert.interface';

@Resolver(() => Alert)
export class AlertInterfaceResolver {
  constructor(
    private readonly alertService: AlertService,
    private readonly userService: UserService,
    private readonly pubsub: PubSubService,
  ) {}

  @ResolveField()
  async recipient(@Parent() parent: Alert) {
    return this.userService.getUser(parent.recipientId);
  }

  @ResolveField()
  async createdBy(@Parent() parent: Alert) {
    return this.userService.getUser(parent.createdById);
  }

  @Query(() => [Alert])
  async alerts() {
    return this.alertService.getAlerts();
  }

  @Mutation(() => Alert)
  async acknowledgeAlert(alertId: number) {
    return this.alertService.acknowledgeAlert(alertId);
  }

  @Subscription(() => Alert, {
    name: 'alerts',
    filter(payload: NotificationPayload, _, { user }: IContext) {
      return payload.recipients.includes(user.id);
    },
  })
  async alertSubscription() {
    return this.pubsub.asyncIterator('notification.alert.*', {
      pattern: true,
    });
  }
}
