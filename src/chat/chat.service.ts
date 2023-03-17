import { Injectable } from '@nestjs/common';
import { Chat } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getChat(chatId: number): Promise<Chat> {
    return this.prisma.chat.findUniqueOrThrow({
      where: {
        id: chatId,
      },
    });
  }
}
