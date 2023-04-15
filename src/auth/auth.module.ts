import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import authConfig from 'src/config/auth.config';
import { HashModule } from 'src/hash/hash.module';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    HashModule,
    PrismaModule,
  ],
  providers: [JwtStrategy, AuthService],
  exports: [PassportModule, JwtStrategy, AuthService],
})
export class AuthModule {}
