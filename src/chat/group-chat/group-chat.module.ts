import { Module, forwardRef } from '@nestjs/common';
import { GroupChatResolver } from './resolvers/group-chat.resolver';
import { ChatModule } from '../chat.module';
import { MemberModule } from 'src/member/member.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GroupChatService } from './services/group-chat.service';
import { PubSubModule } from 'src/pubsub/pubsub.module';

@Module({
  providers: [GroupChatResolver, GroupChatService],
  imports: [
    forwardRef(() => ChatModule),
    MemberModule,
    PrismaModule,
    PubSubModule,
  ],
})
export class GroupChatModule {}
