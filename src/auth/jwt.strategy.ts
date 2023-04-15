import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

import authConfig from 'src/config/auth.config';
import { HashService } from 'src/hash/hash.service';
import { IAuthUser } from './interfaces/auth-user.interface';
import { IChatJwtPayload } from './interfaces/chat-jwt-payload.interface';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  requiredScopes = ['openid', 'profile', 'email'];

  constructor(
    private readonly hashService: HashService,
    @Inject(authConfig.KEY)
    configuration: ConfigType<typeof authConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: configuration.jwksUri,
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: configuration.audience,
      issuer: configuration.issuer,
      algorithms: [configuration.signingAlg],
    });
  }

  async validate(payload: IChatJwtPayload): Promise<IAuthUser> {
    if (!this.hasRequireScope(payload)) {
      throw new UnauthorizedException(
        `JWT does not possess the required scope (${this.requiredScopes}).`,
      );
    }

    const userId = +this.hashService.decode(
      payload['http://localhost:4000/user_id'],
    );

    return await this.authService.getAuthUser(userId);
  }

  hasRequireScope(payload: IChatJwtPayload) {
    const scopes = payload.scope.split(' ');
    return this.requiredScopes.every((requiredScope) =>
      scopes.includes(requiredScope),
    );
  }
}
