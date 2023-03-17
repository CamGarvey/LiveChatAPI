import { Injectable } from '@nestjs/common';
import { Alert } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AlertService {
  currentUserId: number;

  constructor(private readonly prisma: PrismaService) {}

  async getAlerts(): Promise<Alert[]> {
    return await this.prisma.user
      .findUnique({
        where: {
          id: this.currentUserId,
        },
      })
      .alerts();
  }

  async acknowledgeAlert(alertId: number): Promise<Alert> {
    const alert = await this.prisma.alert.update({
      data: {
        recipients: {
          disconnect: {
            id: this.currentUserId,
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
