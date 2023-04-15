import { Test, TestingModule } from '@nestjs/testing';
import { ChatAlertInterfaceResolver } from './chat-alert.resolver';

describe('ChatAlertInterfaceResolver', () => {
  let resolver: ChatAlertInterfaceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatAlertInterfaceResolver],
    }).compile();

    resolver = module.get<ChatAlertInterfaceResolver>(
      ChatAlertInterfaceResolver,
    );
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
