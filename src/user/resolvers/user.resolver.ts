import {
  Resolver,
  Args,
  Query,
  ObjectType,
  ResolveField,
} from '@nestjs/graphql';
import { FilterPaginationArgs, Paginated } from 'src/common/pagination';
import Friend from '../models/friend.model';
import User from '../models/interfaces/user.interface';
import { UserService } from '../user.service';

@Resolver(() => User)
export class UserInterfaceResolver {
  constructor(private readonly userServer: UserService) {}

  @Query(() => PaginatedUser)
  async users(@Args() args: FilterPaginationArgs) {
    return await this.userServer.getUsers(args);
  }
}

@ObjectType()
export class PaginatedUser extends Paginated(User) {}
