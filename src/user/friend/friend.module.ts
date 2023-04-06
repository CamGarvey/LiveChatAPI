import { Module } from '@nestjs/common';
import { FriendResolver } from './resolvers/friend.resolver';
import { FriendService } from './services/friend.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';
import { FriendCacheService } from './resolvers/friend-cache.service';

@Module({
  imports: [PrismaModule, PubSubModule],
  providers: [FriendResolver, FriendService, FriendCacheService],
  exports: [FriendService],
})
export class FriendModule {}
