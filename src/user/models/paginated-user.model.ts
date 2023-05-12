import { ObjectType } from '@nestjs/graphql';
import { Paginated } from 'src/common/models/pagination';
import User from './interfaces/user.interface';

@ObjectType()
export class PaginatedUser extends Paginated(User) {}
