import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HashIdScalar } from './scalars/hash-id.scalar';

@Module({
  providers: [HashIdScalar],
  imports: [PrismaModule],
})
export class CommonModule {}
