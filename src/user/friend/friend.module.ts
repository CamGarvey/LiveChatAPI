import { Module } from '@nestjs/common';
import { FriendResolver } from './resolvers/friend.resolver';
import { FriendService } from './services/friend.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';

@Module({
  imports: [PrismaModule, PubSubModule],
  providers: [FriendResolver, FriendService],
  exports: [FriendService],
})
export class FriendModule {}
