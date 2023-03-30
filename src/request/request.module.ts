import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';
import { UserModule } from 'src/user/user.module';
import { RequestService } from './request.service';
import { FriendRequestResolver } from './resolvers/friend-request.resolver';
import { RequestInterfaceResolver } from './resolvers/request.resolver';

@Module({
  providers: [RequestService, RequestInterfaceResolver, FriendRequestResolver],
  imports: [PubSubModule, PrismaModule, UserModule],
})
export class RequestModule {}
