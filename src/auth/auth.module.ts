import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import authConfig from 'src/config/auth.config';
import { HashModule } from 'src/hash/hash.module';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    HashModule,
    UserModule,
  ],
  providers: [JwtStrategy],
  exports: [PassportModule, JwtStrategy],
})
export class AuthModule {}
