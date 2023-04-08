import { Module } from '@nestjs/common';
import { FriendRequestResolver } from './resolvers/friend-request.resolver';
import { FriendRequestService } from './services/friend-request.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';

@Module({
  providers: [FriendRequestResolver, FriendRequestService],
  imports: [PrismaModule, PubSubModule],
})
export class FriendRequestModule {}
