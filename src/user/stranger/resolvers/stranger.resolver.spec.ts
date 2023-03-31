import { Test, TestingModule } from '@nestjs/testing';
import { StrangerResolver } from './stranger.resolver';

describe('StrangerResolver', () => {
  let resolver: StrangerResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StrangerResolver],
    }).compile();

    resolver = module.get<StrangerResolver>(StrangerResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
