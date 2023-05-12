import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  LoggerService,
  Post,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import authConfig from 'src/config/auth.config';
import { Public } from '../decorators/public.decorator';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from './dto';

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
  async createUserHook(@Body() body: CreateUserDto) {
    const { secret, name, username, email } = body;
    this.logger.debug('Creating user', { name, username, email });

    if (secret !== this.configuration.hookSecret) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    if (await this.authService.isUsernameTaken(username)) {
      throw new HttpException('Username taken', HttpStatus.CONFLICT);
    }

    const ecodedId = await this.authService.createUser({
      name,
      username,
      email,
    });

    return {
      userId: ecodedId,
    };
  }
}
