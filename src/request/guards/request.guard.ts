import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { HashService } from 'src/hash/hash.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RequestGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { req } = GqlExecutionContext.create(context).getContext();
    const requestId = +this.hashService.decode(req.body.variables.requestId);
    const userId = req.user.id;

    const request = await this.prisma.request.findUniqueOrThrow({
      select: {
        recipientId: true,
        state: true,
      },
      where: {
        id: requestId,
      },
    });

    switch (request.state) {
      case 'ACCEPTED':
        break;
      case 'DECLINED':
        break;
      case 'SENT':
        break;
    }

    if (request.recipientId !== userId) {
      throw new GraphQLError(
        'You do not have permission to accept this request',
      );
    }

    if (request.state !== 'SENT') {
      throw new GraphQLError('Invalid state', {
        extensions: {
          code: 'FORBIDDEN',
        },
      });
    }

    return true;
  }
}
