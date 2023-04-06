import { Module, forwardRef } from '@nestjs/common';
import { StrangerResolver } from './resolvers/stranger.resolver';
import { UserModule } from '../user.module';
import { FriendModule } from '../friend/friend.module';

@Module({
  providers: [StrangerResolver],
  imports: [forwardRef(() => UserModule), FriendModule],
})
export class StrangerModule {}
