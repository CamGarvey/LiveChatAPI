import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import Me from '../models/me.model';
import { UserService } from '../../services/user.service';
import { ChatService } from 'src/chat/chat.service';

@Resolver(() => Me)
export class MeResolver {
  constructor(private readonly userService: UserService) {}

  @ResolveField()
  async chats(@CurrentUser() user: IAuthUser) {
    return this.userService.getUserChats(user.id);
  }

  @Query(() => Me)
  async me(@CurrentUser() user: IAuthUser) {
    return this.userService.getUser(user.id);
  }
}
