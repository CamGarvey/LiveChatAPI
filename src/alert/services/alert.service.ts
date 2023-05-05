import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Alert, Prisma } from '@prisma/client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AlertService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  getAlert(alertId: number): Prisma.Prisma__AlertClient<Alert> {
    this.logger.debug('Getting alert', { alertId });

    return this.prisma.alert.findUniqueOrThrow({
      where: { id: alertId },
    });
  }

  async acknowledgeAlert(
    alertId: number,
    acknowledgedById: number,
  ): Promise<Alert> {
    this.logger.debug('Acknowledging alert', { alertId, acknowledgedById });

    const alert = await this.prisma.alert.update({
      data: {
        recipients: {
          disconnect: {
            id: acknowledgedById,
          },
        },
      },
      include: {
        recipients: {
          select: {
            id: true,
          },
        },
      },
      where: {
        id: alertId,
      },
    });

    // If there are no more recipients (everyone has acknowledged)
    // then delete the alert
    if (alert.recipients.length === 0) {
      await this.prisma.alert.delete({
        where: {
          id: alertId,
        },
      });
    }

    return alert;
  }
}
