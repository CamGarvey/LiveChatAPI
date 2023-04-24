import { Module } from '@nestjs/common';
import { FriendRequestService } from './services/friend-request.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';
import { FriendRequestResolver } from './friend-request.resolver';

@Module({
  providers: [FriendRequestResolver, FriendRequestService],
  imports: [PrismaModule, PubSubModule],
})
export class FriendRequestModule {}
