import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserInterfaceResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  providers: [UserInterfaceResolver, UserService],
  imports: [PrismaModule],
})
export class UserModule {}
