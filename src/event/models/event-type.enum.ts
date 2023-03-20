import { registerEnumType } from '@nestjs/graphql';
import { EventType } from '@prisma/client';

registerEnumType(EventType, {
  name: 'EventType',
});
