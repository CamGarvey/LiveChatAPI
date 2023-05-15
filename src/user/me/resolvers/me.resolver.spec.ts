import { Test, TestingModule } from '@nestjs/testing';
import { MeResolver } from './me.resolver';
import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { UserService } from 'src/user/services/user.service';
import { IAuthUser } from 'src/auth/interfaces/auth-user.interface';
import { Alert, Chat, Prisma, Request, User } from '@prisma/client';

describe('MeResolver', () => {
  let resolver: MeResolver;
  let userServiceMock: DeepMockProxy<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeResolver,
        {
          provide: UserService,
          useValue: mockDeep<UserService>(),
        },
      ],
    }).compile();

    resolver = module.get<MeResolver>(MeResolver);
    userServiceMock = module.get(UserService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('query', () => {
    let userClientMock: DeepMockProxy<Prisma.Prisma__UserClient<User>>;

    beforeEach(() => {
      userClientMock = mockDeep<Prisma.Prisma__UserClient<User>>();
    });

    describe('chats', () => {
      it('should use the UserService to get the current users chats', async () => {
        const expectedChats = [mockDeep<Chat>()];
        const expectedUserId = 1;
        const currentUserMock = mockDeep<IAuthUser>();
        currentUserMock.id = expectedUserId;
        userServiceMock.getUserChats.mockResolvedValueOnce(expectedChats);

        const chats = await resolver.chats(currentUserMock);

        expect(chats).toBe(expectedChats);
        expect(userServiceMock.getUserChats).toBeCalledWith(expectedUserId);
      });
    });

    describe('requests', () => {
      it('should use the UserService to get the current users requests', async () => {
        const expectedRequests = [mockDeep<Request>()];
        const currentUserMock = mockDeep<IAuthUser>();
        const expectedUserId = 1;
        currentUserMock.id = expectedUserId;
        userServiceMock.getUser.mockReturnValue(userClientMock);
        userClientMock.requests.mockResolvedValueOnce(expectedRequests);

        const requests = await resolver.requests(currentUserMock);

        expect(requests).toBe(expectedRequests);
        expect(userServiceMock.getUser).toBeCalledWith(expectedUserId);
        expect(userClientMock.requests).toHaveBeenCalled();
      });
    });

    describe('alerts', () => {
      it('should use the UserService to get the current users alerts', async () => {
        const expectedAlerts = [mockDeep<Alert>()];
        const currentUserMock = mockDeep<IAuthUser>();
        const expectedUserId = 1;
        currentUserMock.id = expectedUserId;
        userServiceMock.getUser.mockReturnValue(userClientMock);
        userClientMock.alerts.mockResolvedValueOnce(expectedAlerts);

        const alerts = await resolver.alerts(currentUserMock);

        expect(alerts).toBe(expectedAlerts);
        expect(userServiceMock.getUser).toBeCalledWith(expectedUserId);
        expect(userClientMock.alerts).toHaveBeenCalled();
      });
    });

    describe('me', () => {
      it('should use the UserService to get the current user', async () => {
        const currentUserMock = mockDeep<IAuthUser>();
        const expectedUserId = 1;
        currentUserMock.id = expectedUserId;
        userServiceMock.getUser.mockReturnValue(userClientMock);

        const me = await resolver.me(currentUserMock);

        expect(me).toBe(userClientMock);
        expect(userServiceMock.getUser).toBeCalledWith(expectedUserId);
      });
    });
  });
});
