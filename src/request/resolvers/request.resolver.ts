import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import { PubSubService } from 'src/pubsub/pubsub.service';
import { RequestReceiverGuard } from '../guards/request-receiver/request-receiver.guard';
import { RequestSenderGuard } from '../guards/request-sender/request-sender.guard';
import Request from '../models/interfaces/request.interface';
import { RequestService } from '../services/request.service';

@Resolver(() => Request)
export class RequestInterfaceResolver {
  constructor(
    private readonly requestService: RequestService,
    private readonly pubsub: PubSubService,
  ) {}

  @ResolveField()
  async createdBy(@Parent() parent: Request) {
    return await this.requestService.getRequest(parent.id).createdBy();
  }

  @ResolveField()
  async isCreator(@Parent() parent: Request, @CurrentUser() user: IAuthUser) {
    return parent.createdById === user.id;
  }

  @ResolveField()
  async recipient(@Parent() parent: Request) {
    return await this.requestService.getRequest(parent.id).recipient();
  }

  @Mutation(() => Request)
  @UseGuards(RequestReceiverGuard)
  async acceptRequest(
    @Args('requestId', { type: () => HashIdScalar }) requestId: number,
  ) {
    return await this.requestService.acceptRequest(requestId);
  }

  @Mutation(() => Request)
  @UseGuards(RequestReceiverGuard)
  async declineRequest(
    @Args('requestId', { type: () => HashIdScalar }) requestId: number,
  ) {
    return await this.requestService.declineRequest(requestId);
  }

  @Mutation(() => Request)
  @UseGuards(RequestSenderGuard)
  async cancelRequest(
    @Args('requestId', { type: () => HashIdScalar }) requestId: number,
  ) {
    return await this.requestService.cancelRequest(requestId);
  }

  @Mutation(() => Request)
  @UseGuards(RequestSenderGuard)
  async deleteRequest(
    @Args('requestId', { type: () => HashIdScalar }) requestId: number,
  ) {
    return await this.requestService.deletedRequest(requestId);
  }

  @Subscription(() => Request, {
    resolve: (payload) => payload,
  })
  async requests(@CurrentUser() user: IAuthUser) {
    return this.pubsub.asyncIterator(`user-requests/${user.id}`, {
      pattern: true,
    });
  }
}
