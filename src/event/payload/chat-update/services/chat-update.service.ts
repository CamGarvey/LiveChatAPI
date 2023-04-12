import { Injectable } from '@nestjs/common';
import { ChatUpdate, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatUpdateService {
  constructor(private readonly prisma: PrismaService) {}

  getChatUpdate(eventId: number): Prisma.Prisma__ChatUpdateClient<ChatUpdate> {
    return this.prisma.chatUpdate.findUniqueOrThrow({
      where: {
        eventId,
      },
    });
  }
}
