import { Test, TestingModule } from '@nestjs/testing';
import { DirectMessageChatResolver } from './direct-message-chat.resolver';

describe('DirectMessageChatResolver', () => {
  let resolver: DirectMessageChatResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DirectMessageChatResolver],
    }).compile();

    resolver = module.get<DirectMessageChatResolver>(DirectMessageChatResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
