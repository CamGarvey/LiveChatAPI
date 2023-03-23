import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import hashConfig from 'src/config/hash.config';
import { HashService } from './hash.service';

@Global()
@Module({
  providers: [HashService],
  imports: [ConfigModule.forFeature(hashConfig)],
  exports: [HashService],
})
export class HashModule {}
