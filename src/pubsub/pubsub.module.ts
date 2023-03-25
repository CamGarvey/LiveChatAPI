import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import redisConfig from 'src/config/redis.config';
import { PubSubService } from './pubsub.service';

@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [PubSubService],
  exports: [PubSubService],
})
export class PubSubModule {}
