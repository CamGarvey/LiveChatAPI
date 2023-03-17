import {
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AlertService } from 'src/alert/alert.service';
import { UserService } from 'src/user/user.service';
import Alert from '../models/interfaces/alert.interface';

@Resolver(() => Alert)
export class AlertInterfaceResolver {
  constructor(
    private readonly alertService: AlertService,
    private readonly userService: UserService,
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
}
