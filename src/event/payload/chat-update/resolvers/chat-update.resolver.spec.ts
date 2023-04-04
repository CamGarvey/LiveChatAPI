import { Test, TestingModule } from '@nestjs/testing';
import { ChatUpdateResolver } from './chat-update.resolver';

describe('ChatUpdateResolver', () => {
  let resolver: ChatUpdateResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatUpdateResolver],
    }).compile();

    resolver = module.get<ChatUpdateResolver>(ChatUpdateResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
