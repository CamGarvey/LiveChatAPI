import { Query } from '@nestjs/common';
import { Args, ObjectType, Resolver } from '@nestjs/graphql';
import { RequestState } from '@prisma/client';
import Request from 'src/request/request.model';
import Me from './me.model';
import { MeService } from './me.service';

@Resolver((of) => Me)
export class MeResolver {
  constructor(private readonly meService: MeService) {}

  // @Query(() => [Request])
  // async requests(
  //   @Args('state', { nullable: true }) state?: RequestState,
  // ): Promise<Request[]> {
  //   return this.meService.getReceivedRequests();
  // }
}
