import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { FriendRequest } from '../models/friend-request.model';
import { RequestService } from '../../request.service';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';

@Resolver(() => FriendRequest)
export class FriendRequestResolver {
  constructor(private readonly requestService: RequestService) {}

  @Mutation(() => FriendRequest)
  async sendFriendRequest(
    @Args('userId', { type: () => HashIdScalar }) userId: number,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.requestService.sendFriendRequest(userId, user.id);
  }
}
