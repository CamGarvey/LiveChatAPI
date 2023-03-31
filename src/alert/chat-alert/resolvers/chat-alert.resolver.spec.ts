import { Test, TestingModule } from '@nestjs/testing';
import { ChatAlertResolver } from './chat-alert.resolver';

describe('ChatAlertResolver', () => {
  let resolver: ChatAlertResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatAlertResolver],
    }).compile();

    resolver = module.get<ChatAlertResolver>(ChatAlertResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
