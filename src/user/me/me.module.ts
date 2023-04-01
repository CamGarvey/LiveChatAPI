import { CacheModule, Module, forwardRef } from '@nestjs/common';
import { MeResolver } from './resolvers/me.resolver';
import { UserModule } from '../user.module';

@Module({
  providers: [MeResolver],
  imports: [forwardRef(() => UserModule)],
})
export class MeModule {}
