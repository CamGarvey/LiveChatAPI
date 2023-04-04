import { Test, TestingModule } from '@nestjs/testing';
import { ChatMemberAlterationResolver } from './chat-member-alteration.resolver';

describe('ChatMemberAlterationResolver', () => {
  let resolver: ChatMemberAlterationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatMemberAlterationResolver],
    }).compile();

    resolver = module.get<ChatMemberAlterationResolver>(ChatMemberAlterationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
