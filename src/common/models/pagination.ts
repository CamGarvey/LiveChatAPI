import { Field, ObjectType, Int, ArgsType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

interface IPageInfo {
  endCursor: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
}

interface IEdgeType<T> {
  cursor: string;
  node: T;
}

export interface IPaginatedType<T> {
  edges: IEdgeType<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}

@ObjectType()
class PageInfo implements IPageInfo {
  @Field((type) => String)
  endCursor: string;

  @Field((type) => Boolean)
  hasNextPage: boolean;

  @Field((type) => Boolean)
  hasPreviousPage: boolean;

  @Field((type) => String)
  startCursor: string;
}

export function Paginated<T>(classRef: Type<T>): Type<IPaginatedType<T>> {
  @ObjectType(`${classRef.name}Edge`)
  abstract class EdgeType {
    @Field((type) => String)
    cursor: string;

    @Field((type) => classRef)
    node: T;
  }

  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IPaginatedType<T> {
    @Field((type) => [EdgeType], { nullable: true })
    edges: EdgeType[];

    @Field((type) => PageInfo)
    pageInfo: PageInfo;

    @Field()
    totalCount: number;
  }
  return PaginatedType as Type<IPaginatedType<T>>;
}

@ArgsType()
export class PaginationArgs {
  @Field(() => String, { nullable: true })
  after?: string;

  @Field(() => String, { nullable: true })
  before?: string;

  @Field(() => Int, { nullable: true })
  first?: number;

  @Field(() => Int, { nullable: true })
  last?: number;
}

@ArgsType()
export class FilterPaginationArgs extends PaginationArgs {
  @Field(() => String, { nullable: true })
  filter?: string;
}
