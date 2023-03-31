import { Module } from '@nestjs/common';
import { PubSubModule } from 'src/pubsub/pubsub.module';
import { PrismaModule } from '../prisma/prisma.module';
import { KnownUserInterfaceResolver } from './known-user/known-user.resolver';
import { MeResolver } from './me/resolvers/me.resolver';
import { UserInterfaceResolver } from './resolvers/user.resolver';
import { UserService } from './user.service';
import { MeModule } from './me/me.module';
import { KnownUserModule } from './known-user/known-user.module';
import { StrangerModule } from './stranger/stranger.module';
import { FriendModule } from './friend/friend.module';

@Module({
  providers: [UserInterfaceResolver, UserService],
  imports: [
    PrismaModule,
    PubSubModule,
    MeModule,
    KnownUserModule,
    StrangerModule,
    FriendModule,
  ],
  exports: [UserService],
})
export class UserModule {}
