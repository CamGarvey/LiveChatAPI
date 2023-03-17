import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { FriendRequest } from '../models/friend-request.model';
import { RequestService } from '../request.service';

@Resolver(() => FriendRequest)
export class FriendRequestResolver {
  constructor(private readonly requestService: RequestService) {}

  @Mutation(() => FriendRequest)
  async sendFriendRequest(@Args('userId') userId: number) {
    return this.requestService.sendFriendRequest(userId);
  }
}
