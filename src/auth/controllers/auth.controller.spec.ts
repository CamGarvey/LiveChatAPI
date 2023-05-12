import { LoggerService } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import authConfig from 'src/config/auth.config';
import { AuthService } from '../services/auth.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: DeepMockProxy<AuthService>;
  let configServiceMock: DeepMockProxy<ConfigType<typeof authConfig>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthController,
        {
          provide: AuthService,
          useValue: mockDeep<AuthService>(),
        },
        {
          provide: authConfig.KEY,
          useValue: mockDeep<ConfigType<typeof authConfig>>(),
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockDeep<LoggerService>(),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authServiceMock = module.get(AuthService);
    configServiceMock = module.get(authConfig.KEY);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUserHook', () => {
    it('should throw 403 Forbidden if secrets do not match', async () => {
      configServiceMock.hookSecret = 'top-secret-secret';

      expect(
        controller.createUserHook({
          username: 'JakeTheDog',
          email: 'pancakes@test.com',
          secret: 'incorrect-secret',
        }),
      ).rejects.toThrow('Forbidden');
    });

    it('should throw 409 Username taken if username is taken', async () => {
      configServiceMock.hookSecret = 'top-secret-secret';
      const user = {
        username: 'JakeTheDog',
        email: 'pancakes@test.com',
        secret: 'top-secret-secret',
      };
      authServiceMock.isUsernameTaken.mockResolvedValueOnce(true);

      expect(controller.createUserHook(user)).rejects.toThrow('Username taken');
      expect(authServiceMock.isUsernameTaken).toBeCalledWith(user.username);
    });

    it('should create user with body data and return encoded id', async () => {
      const encodedId = 'j4K#';
      const user = {
        username: 'JakeTheDog',
        email: 'pancakes@test.com',
        secret: 'top-secret-secret',
      };
      configServiceMock.hookSecret = 'top-secret-secret';
      authServiceMock.isUsernameTaken.mockResolvedValueOnce(false);
      authServiceMock.createUser.mockResolvedValueOnce(encodedId);

      await expect(controller.createUserHook(user)).resolves.toMatchObject({
        userId: encodedId,
      });
      expect(authServiceMock.createUser).toBeCalledWith({
        name: undefined,
        username: user.username,
        email: user.email,
      });
    });
  });
});
