import { ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloDriver } from '@nestjs/apollo/dist/drivers';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthorizationModule } from './authorization/authorization.module';
import { RequestModule } from './request/request.module';
import { join } from 'path';
import { AlertModule } from './alert/alert.module';
import { EventModule } from './event/event.module';
import { MemberModule } from './member/member.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      subscriptions: {
        'graphql-ws': true,
      },
      sortSchema: true,
    }),
    UserModule,
    AuthorizationModule,
    RequestModule,
    RequestModule,
    AlertModule,
    EventModule,
    MemberModule,
  ],
  // providers: [UserService, KnownUserService, FriendService],
})
export class AppModule {}
