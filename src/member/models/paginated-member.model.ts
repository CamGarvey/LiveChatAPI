import { ObjectType } from '@nestjs/graphql';
import Member from './interfaces/member.interface';
import { Paginated } from 'src/prisma/models/pagination';

@ObjectType()
export class PaginatedMember extends Paginated(Member) {}
