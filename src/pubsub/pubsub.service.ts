import { Injectable } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Redis, RedisOptions } from 'ioredis';

@Injectable()
export class PubSubService extends RedisPubSub {
  constructor() {
    const redisOptions: RedisOptions = {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
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
