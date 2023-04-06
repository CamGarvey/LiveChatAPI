import { Module } from '@nestjs/common';
import { PubSubModule } from 'src/pubsub/pubsub.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UserInterfaceResolver } from './resolvers/user.resolver';
import { UserService } from './services/user.service';
import { MeModule } from './me/me.module';
import { StrangerModule } from './stranger/stranger.module';
import { FriendModule } from './friend/friend.module';
import { FriendService } from './friend/services/friend.service';

@Module({
  providers: [UserInterfaceResolver, UserService],
  imports: [PrismaModule, PubSubModule, MeModule, StrangerModule, FriendModule],
  exports: [UserService],
})
export class UserModule {}
