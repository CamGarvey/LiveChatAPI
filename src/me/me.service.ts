import { Injectable } from '@nestjs/common';
import { PrismaClient, RequestState } from '@prisma/client';

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaClient) {}

  async getReceivedRequests(state?: RequestState) {
    return await this.prisma.user
      .findUniqueOrThrow({
        where: {
          id: 1, // this.currentUserId,
        },
      })
      .requests({
        where: {
          state: state ?? undefined,
        },
      });
  }

  async getSentRequests(state?: RequestState) {
    return await this.prisma.user
      .findUniqueOrThrow({
        where: {
          id: 1, // this.currentUserId,
        },
      })
      .requestsSent({
        where: {
          state: state ?? undefined,
        },
      });
  }
}
