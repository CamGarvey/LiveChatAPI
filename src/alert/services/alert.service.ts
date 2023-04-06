import { Injectable } from '@nestjs/common';
import { Alert, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AlertService {
  constructor(private readonly prisma: PrismaService) {}

  getAlert(alertId: number): Prisma.Prisma__AlertClient<Alert> {
    return this.prisma.alert.findUniqueOrThrow({
      where: { id: alertId },
    });
  }

  async acknowledgeAlert(
    alertId: number,
    acknowledgedById: number,
  ): Promise<Alert> {
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
