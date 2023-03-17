import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FriendResolver } from './resolvers/friend.resolver';
import { KnownUserInterfaceResolver } from './resolvers/known-user.resolver';
import { MeResolver } from './resolvers/me.resolver';
import { UserInterfaceResolver } from './resolvers/user.resolver';
import { UserService } from './user.service';

@Module({
  providers: [
    UserInterfaceResolver,
    MeResolver,
    FriendResolver,
    KnownUserInterfaceResolver,
    UserService,
  ],
  imports: [PrismaModule],
})
export class UserModule {}
