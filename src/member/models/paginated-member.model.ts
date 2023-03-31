import { ObjectType } from '@nestjs/graphql';
import { Paginated } from 'src/common/models/pagination';
import Member from './interfaces/member.interface';

@ObjectType()
export class PaginatedMember extends Paginated(Member) {}
