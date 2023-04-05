import { Test, TestingModule } from '@nestjs/testing';
import { ChatUpdateInterfaceResolver } from './chat-update.resolver';

describe('ChatUpdateResolver', () => {
  let resolver: ChatUpdateInterfaceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatUpdateInterfaceResolver],
    }).compile();

    resolver = module.get<ChatUpdateInterfaceResolver>(
      ChatUpdateInterfaceResolver,
    );
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
