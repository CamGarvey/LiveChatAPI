import { Module, forwardRef } from '@nestjs/common';
import { StrangerResolver } from './resolvers/stranger.resolver';
import { UserModule } from '../user.module';

@Module({
  providers: [StrangerResolver],
  imports: [forwardRef(() => UserModule)],
})
export class StrangerModule {}
