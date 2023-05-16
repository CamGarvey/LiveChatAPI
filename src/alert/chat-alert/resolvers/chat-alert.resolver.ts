import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { AlertService } from 'src/alert/services/alert.service';
import { PubSubService } from 'src/pubsub/pubsub.service';
import ChatAlert from '../models/interfaces/chat-alert.interface';

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
}
