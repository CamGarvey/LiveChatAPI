import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';
import { MemberService } from './member.service';
import { MemberInterfaceResolver } from './resolvers/member.resolver';

@Module({
  providers: [MemberService, MemberInterfaceResolver],
  imports: [PrismaModule, PubSubModule],
  exports: [MemberService],
})
export class MemberModule {}
