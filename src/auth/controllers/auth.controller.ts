import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Request, Response } from 'express';
import authConfig from 'src/config/auth.config';
import { Public } from '../decorators/public.decorator';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(authConfig.KEY)
    private configuration: ConfigType<typeof authConfig>,
    private authService: AuthService,
  ) {}

  @Public()
  @Post('create-user-hook')
  @HttpCode(HttpStatus.CREATED)
  async createUserHook(@Req() request: Request, @Res() res: Response) {
    const { secret, name, username, email } = request.body;

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
