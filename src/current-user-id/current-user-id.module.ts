import { Module } from '@nestjs/common';
import { HashModule } from 'src/hash/hash.module';
import { CurrentUserIdPipe } from './current-user-id.pipe';

@Module({
  providers: [CurrentUserIdPipe],
  imports: [HashModule],
})
export class CurrentUserIdModule {}
