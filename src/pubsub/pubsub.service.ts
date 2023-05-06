import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Redis, RedisOptions } from 'ioredis';
import redisConfig from 'src/config/redis.config';

@Injectable()
export class PubSubService extends RedisPubSub {
  constructor(
    @Inject(redisConfig.KEY)
    configuration: ConfigType<typeof redisConfig>,
  ) {
    const redisOptions: RedisOptions = {
      host: configuration.host,
      port: configuration.port,
      password: configuration.password,
      retryStrategy: (times: any) => {
        // reconnect after
        return Math.min(times * 50, 2000);
      },
    };

    super({
      publisher: new Redis(redisOptions),
      subscriber: new Redis(redisOptions),
    });
  }
}
