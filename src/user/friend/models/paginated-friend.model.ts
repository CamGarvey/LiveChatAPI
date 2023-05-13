import { Paginated } from 'src/prisma/models/pagination';
import Friend from './friend.model';
import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginatedFriend extends Paginated(Friend) {}
