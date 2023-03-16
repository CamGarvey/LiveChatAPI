import { Module } from '@nestjs/common';
import { MeService } from './me.service';
import { MeResolver } from './me.resolver';

@Module({
  providers: [MeService, MeResolver],
})
export class MeModule {}
