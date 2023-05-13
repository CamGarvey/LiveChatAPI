import { ObjectType } from '@nestjs/graphql';
import { Paginated } from 'src/prisma/models/pagination';
import Event from './interfaces/event.interface';

@ObjectType()
export class PaginatedEvent extends Paginated(Event) {}
