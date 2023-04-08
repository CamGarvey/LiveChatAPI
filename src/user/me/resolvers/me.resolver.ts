import { Query, ResolveField, Resolver } from '@nestjs/graphql';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import Me from '../models/me.model';
import { UserService } from '../../services/user.service';
import Alert from 'src/alert/models/interfaces/alert.interface';
import Request from 'src/request/models/interfaces/request.interface';

@Resolver(() => Me)
export class MeResolver {
  constructor(private readonly userService: UserService) {}

  @ResolveField()
  async chats(@CurrentUser() user: IAuthUser) {
    return this.userService.getUserChats(user.id);
  }

  @Query(() => [Request])
  async requests(@CurrentUser() user: IAuthUser) {
    return await this.userService.getUser(user.id).requests();
  }

  @Query(() => [Alert])
  async alerts(@CurrentUser() user: IAuthUser) {
    return await this.userService.getUser(user.id).alerts();
  }

  @Query(() => Me)
  async me(@CurrentUser() user: IAuthUser) {
    return this.userService.getUser(user.id);
  }
}
