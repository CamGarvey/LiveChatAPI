import {
  Args,
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
import { UserService } from 'src/user/services/user.service';
import Alert from '../models/interfaces/alert.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';

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
  async alerts(@CurrentUser() user: IAuthUser) {
    return this.alertService.getAlerts(user.id);
  }

  @Mutation(() => Alert)
  async acknowledgeAlert(
    @Args('alertId', { type: () => HashIdScalar }) alertId: number,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.alertService.acknowledgeAlert(alertId, user.id);
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
