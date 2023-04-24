import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HashIdScalar } from './scalars/hash-id.scalar';
import { DateScalar } from './scalars/date.scalar';

@Module({
  providers: [HashIdScalar, DateScalar],
  imports: [PrismaModule],
})
export class CommonModule {}
