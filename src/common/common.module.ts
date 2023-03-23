import { Module } from '@nestjs/common';
import { HashIdScalar } from './scalars/hash-id.scalar';

@Module({
  providers: [HashIdScalar],
})
export class CommonModule {}
