import { Test, TestingModule } from '@nestjs/testing';
import { ChatAlertInterfaceResolver } from './chat-alert.resolver';
import { AlertModule } from 'src/alert/alert.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

fdescribe('ChatAlertInterfaceResolver', () => {
  let resolver: ChatAlertInterfaceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatAlertInterfaceResolver],
      // imports: [AlertModule, PubSubModule],
    }).compile();

    resolver = module.get<ChatAlertInterfaceResolver>(
      ChatAlertInterfaceResolver,
    );
  });

  fit('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
