import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MemberService } from './member.service';

@Module({
  providers: [MemberService],
  imports: [PrismaModule],
})
export class MemberModule {}
