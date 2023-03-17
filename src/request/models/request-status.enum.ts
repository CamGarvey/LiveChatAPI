import { registerEnumType } from '@nestjs/graphql';

export enum RequestState {
  Sent,
  Cancelled,
  Accepted,
  Declined,
}

registerEnumType(RequestState, {
  name: 'RequestState',
});
