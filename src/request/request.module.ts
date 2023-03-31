import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';
import { UserModule } from 'src/user/user.module';
import { RequestService } from './request.service';
import { RequestInterfaceResolver } from './resolvers/request.resolver';
import { FriendRequestModule } from './friend-request/friend-request.module';

@Module({
  providers: [RequestService, RequestInterfaceResolver],
  imports: [PubSubModule, PrismaModule, UserModule, FriendRequestModule],
  exports: [RequestService],
})
export class RequestModule {}
