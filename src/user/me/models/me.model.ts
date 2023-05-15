import { ObjectType } from '@nestjs/graphql';
import User from 'src/user/models/interfaces/user.interface';
import { PaginatedUser } from 'src/user/resolvers/user.resolver';

@ObjectType({
  implements: () => [User],
})
export default class Me implements User {
  id: number;
  username: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  friends: PaginatedUser;
}
