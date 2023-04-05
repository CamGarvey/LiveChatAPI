import { Test, TestingModule } from '@nestjs/testing';
import { ChatUpdateService } from './chat-update.service';

describe('ChatUpdateService', () => {
  let service: ChatUpdateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatUpdateService],
    }).compile();

    service = module.get<ChatUpdateService>(ChatUpdateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
