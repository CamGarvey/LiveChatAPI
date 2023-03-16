import { ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloDriver } from '@nestjs/apollo/dist/drivers';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthorizationModule } from './authorization/authorization.module';
import { RequestModule } from './request/request.module';
import { NotificationModule } from './notification/notification.module';
import { FriendModule } from './friend/friend.module';
import { join } from 'path';
import { KnownUserService } from './known-user/known-user.service';
import { KnownUserModule } from './known-user/known-user.module';
import { FriendService } from './friend/friend.service';
import { UserService } from './user/user.service';
import { MeModule } from './me/me.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   typePaths: ['./**/*.graphql'],
    //   subscriptions: {
    //     'graphql-ws': true,
    //   },
    //   context: ({ req }) => ({ req }),
    // }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      subscriptions: {
        'graphql-ws': true,
      },
      sortSchema: true,
    }),
    UserModule,
    KnownUserModule,
    AuthorizationModule,
    RequestModule,
    NotificationModule,
    FriendModule,
    MeModule,
    RequestModule,
  ],
  // providers: [UserService, KnownUserService, FriendService],
})
export class AppModule {}
