import { ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloDriver } from '@nestjs/apollo/dist/drivers';
import { CacheModule, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { RequestModule } from './request/request.module';
import { join } from 'path';
import { AlertModule } from './alert/alert.module';
import { EventModule } from './event/event.module';
import { MemberModule } from './member/member.module';
import { AuthModule } from './auth/auth.module';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import corsConfig from './config/cors.config';
import databaseConfig from './config/database.config';
import hashConfig from './config/hash.config';
import redisConfig from './config/redis.config';
import { JwtStrategy } from './auth/jwt.strategy';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { CommonModule } from './common/common.module';
import { HashModule } from './hash/hash.module';
import { APP_GUARD } from '@nestjs/core';
import { GqlAuthGuard } from './auth/gql-auth.guard';
import { RedisOptions } from 'ioredis';
import { FriendModule } from './user/friend/friend.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        appConfig,
        authConfig,
        corsConfig,
        databaseConfig,
        hashConfig,
        redisConfig,
      ],
    }),
    CacheModule.registerAsync<RedisOptions>({
      imports: [ConfigModule.forFeature(redisConfig)],
      useFactory: async (configuration: ConfigType<typeof redisConfig>) => ({
        host: configuration.host,
        port: configuration.port,
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      subscriptions: {
        'graphql-ws': true,
      },
      sortSchema: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    UserModule,
    ChatModule,
    RequestModule,
    RequestModule,
    AlertModule,
    EventModule,
    MemberModule,
    AuthModule,
    CommonModule,
    HashModule,
    FriendModule,
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: GqlAuthGuard,
    },
  ],
})
export class AppModule {}
