import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  LoggerService,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import authConfig from 'src/config/auth.config';
import { Public } from '../decorators/public.decorator';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(authConfig.KEY)
    private configuration: ConfigType<typeof authConfig>,
    private authService: AuthService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  @Public()
  @Post('create-user-hook')
  @HttpCode(HttpStatus.CREATED)
  async createUserHook(@Req() request: Request, @Res() res: Response) {
    const { secret, name, username, email } = request.body;
    this.logger.debug('Creating user', { name, username, email });

    if (secret !== this.configuration.hookSecret) {
      return res.status(HttpStatus.FORBIDDEN).send();
    }

    if (await this.authService.isUsernameTaken(username)) {
      return res.status(HttpStatus.CONFLICT).send();
    }

    const ecodedId = await this.authService.createUser({
      name,
      username,
      email,
    });

    res.status(HttpStatus.CREATED).send({
      userId: ecodedId,
    });
  }
}
