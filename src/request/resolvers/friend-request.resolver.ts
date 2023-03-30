import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { CurrentUser } from 'src/common/current-user.decorator';
import { FriendRequest } from '../models/friend-request.model';
import { RequestService } from '../request.service';

@Resolver(() => FriendRequest)
export class FriendRequestResolver {
  constructor(private readonly requestService: RequestService) {}

  @Mutation(() => FriendRequest)
  async sendFriendRequest(
    @Args('userId') userId: number,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.requestService.sendFriendRequest(userId, user.id);
  }
}
