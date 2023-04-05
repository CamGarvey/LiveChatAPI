import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatUpdateService {
  constructor(private readonly prisma: PrismaService) {}

  getChatUpdate(eventId: number) {
    return this.prisma.chatUpdate.findUniqueOrThrow({
      where: {
        eventId,
      },
    });
  }
}
