import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { AlertService } from 'src/alert/services/alert.service';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { UserService } from 'src/user/services/user.service';
import Alert from '../models/interfaces/alert.interface';

@Resolver(() => Alert)
export class AlertInterfaceResolver {
  constructor(
    private readonly alertService: AlertService,
    private readonly userService: UserService,
    private readonly pubsub: PubSubService,
  ) {}

  @ResolveField()
  async recipients(@Parent() parent: Alert) {
    return await this.alertService.getAlert(parent.id).recipients();
  }

  @ResolveField()
  async createdBy(@Parent() parent: Alert) {
    return await this.alertService.getAlert(parent.id).createdBy();
  }

  @Query(() => [Alert])
  async alerts(@CurrentUser() user: IAuthUser) {
    return await this.userService.getUser(user.id).alerts();
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
    resolve: (payload) => payload,
  })
  async alertSubscription(@CurrentUser() user: IAuthUser) {
    return this.pubsub.asyncIterator<Alert>(`user-alerts/${user.id}`, {
      pattern: true,
    });
  }
}
