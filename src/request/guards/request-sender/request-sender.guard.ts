import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { HashService } from 'src/hash/hash.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RequestSenderGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req } = GqlExecutionContext.create(context).getContext();
    const requestId = +this.hashService.decode(req.body.variables.requestId);
    const userId = req.user.id;

    const request = await this.prisma.request.findUniqueOrThrow({
      where: { id: requestId },
      select: { createdById: true },
    });

    return request.createdById === userId;
  }
}
