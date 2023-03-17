import { Query, Resolver } from '@nestjs/graphql';
import Me from '../models/me.model';
import { UserService } from '../user.service';

@Resolver(() => Me)
export class MeResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => Me)
  async me() {
    return this.userService.getUser(204);
  }
}
