import { Module, forwardRef } from '@nestjs/common';
import { FriendResolver } from './resolvers/friend.resolver';
import { UserModule } from '../user.module';

@Module({
  providers: [FriendResolver],
  imports: [forwardRef(() => UserModule)],
})
export class FriendModule {}
