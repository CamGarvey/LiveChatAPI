import { Module } from '@nestjs/common';
import { PubSubModule } from 'src/pubsub/pubsub.module';
import { PrismaModule } from '../prisma/prisma.module';
import { FriendResolver } from './resolvers/friend/friend.resolver';
import { KnownUserInterfaceResolver } from './resolvers/known-user/known-user.resolver';
import { MeResolver } from './resolvers/me/me.resolver';
import { UserInterfaceResolver } from './resolvers/user/user.resolver';
import { UserService } from './user.service';

@Module({
  providers: [
    UserInterfaceResolver,
    MeResolver,
    FriendResolver,
    KnownUserInterfaceResolver,
    UserService,
  ],
  imports: [PrismaModule, PubSubModule],
  exports: [UserService],
})
export class UserModule {}
