import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PaginationService } from './pagination.service';

@Module({
  providers: [PrismaService, PaginationService],
  exports: [PrismaService, PaginationService],
})
export class PrismaModule {}
