import { Module, forwardRef } from '@nestjs/common';
import { FriendRequestResolver } from './resolvers/friend-request.resolver';
import { RequestModule } from '../request.module';

@Module({
  providers: [FriendRequestResolver],
  imports: [forwardRef(() => RequestModule)],
})
export class FriendRequestModule {}
