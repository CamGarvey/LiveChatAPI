import { Args, Mutation, Resolver } from '@nestjs/graphql';
import Request from '../models/interfaces/request.interface';
import { RequestService } from '../request.service';

@Resolver(() => Request)
export class RequestInterfaceResolver {
  constructor(private readonly requestService: RequestService) {}

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
}
