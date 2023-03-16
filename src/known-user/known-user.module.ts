import { Module } from '@nestjs/common';
import { FilterPaginationArgs } from 'src/common/pagination';
import { PrismaModule } from 'src/prisma/prisma.module';
import { KnownUserInterfaceResolver } from './known-user.resolver';
import { KnownUserService } from './known-user.service';

@Module({
  providers: [
    FilterPaginationArgs,
    KnownUserInterfaceResolver,
    KnownUserService,
  ],
  imports: [PrismaModule],
})
export class KnownUserModule {}
