import { ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloDriver } from '@nestjs/apollo/dist/drivers';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
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
import { CurrentUserIdModule } from './current-user-id/current-user-id.module';

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
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      context: ({ req }) => ({ req, currentUserId: 2 }),
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      subscriptions: {
        'graphql-ws': true,
      },
      sortSchema: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    UserModule,
    RequestModule,
    RequestModule,
    AlertModule,
    EventModule,
    MemberModule,
    AuthModule,
    CommonModule,
    HashModule,
    CurrentUserIdModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
