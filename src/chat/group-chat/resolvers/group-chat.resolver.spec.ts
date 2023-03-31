import { Test, TestingModule } from '@nestjs/testing';
import { GroupChatResolver } from './group-chat.resolver';

describe('GroupChatResolver', () => {
  let resolver: GroupChatResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupChatResolver],
    }).compile();

    resolver = module.get<GroupChatResolver>(GroupChatResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
