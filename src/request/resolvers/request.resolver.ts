import { Args, Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { IContext } from 'src/auth/interfaces/context.interface';
import { NotificationPayload } from 'src/common/subscriptions/subscription.model';
import { PubSubService } from 'src/pubsub/pubsub.service';
import Request from '../models/interfaces/request.interface';
import { RequestService } from '../request.service';

@Resolver(() => Request)
export class RequestInterfaceResolver {
  constructor(
    private readonly requestService: RequestService,
    private readonly pubsub: PubSubService,
  ) {}

  @Mutation(() => Request)
  async acceptRequest(@Args('requestId') requestId: number) {
    return this.requestService.acceptRequest(requestId);
  }

  @Mutation(() => Request)
  async declineRequest(@Args('requestId') requestId: number) {
    return this.requestService.declineRequest(requestId);
  }

  @Mutation(() => Request)
  async cancelRequest(@Args('requestId') requestId: number) {
    return this.requestService.cancelRequest(requestId);
  }

  @Subscription(() => Request, {
    filter(payload: NotificationPayload, _, { user }: IContext) {
      return payload.recipients.includes(user.id);
    },
  })
  async requests() {
    return this.pubsub.asyncIterator('notification.request.*', {
      pattern: true,
    });
  }
}
