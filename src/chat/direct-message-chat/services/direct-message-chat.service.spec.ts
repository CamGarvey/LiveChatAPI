import { Test, TestingModule } from '@nestjs/testing';
import { DirectMessageChatService } from './direct-message-chat.service';

describe('DirectMessageChatService', () => {
  let service: DirectMessageChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DirectMessageChatService],
    }).compile();

    service = module.get<DirectMessageChatService>(DirectMessageChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
