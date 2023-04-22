import { Test, TestingModule } from '@nestjs/testing';
import { MemberAlterationResolver } from './chat-member-alteration.resolver';

describe('ChatMemberAlterationResolver', () => {
  let resolver: MemberAlterationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemberAlterationResolver],
    }).compile();

    resolver = module.get<MemberAlterationResolver>(MemberAlterationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
