import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import { FriendRequestService } from './services/friend-request.service';
import { FriendRequest } from './models/friend-request.model';

@Resolver(() => FriendRequest)
export class FriendRequestResolver {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  @Mutation(() => FriendRequest)
  async sendFriendRequest(
    @Args('userId', { type: () => HashIdScalar }) userId: number,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.friendRequestService.sendFriendRequest(userId, user.id);
  }
}
