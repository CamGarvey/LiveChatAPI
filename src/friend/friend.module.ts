import { Module } from '@nestjs/common';
import { FilterPaginationArgs } from 'src/common/pagination';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FriendResolver } from './friend.resolver';
import { FriendService } from './friend.service';

@Module({
  providers: [FriendService, FriendResolver, FilterPaginationArgs],
  imports: [PrismaModule],
})
export class FriendModule {}
