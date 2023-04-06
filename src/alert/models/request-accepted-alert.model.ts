import { ObjectType } from '@nestjs/graphql';
import Request from 'src/request/models/interfaces/request.interface';
import User from 'src/user/models/interfaces/user.interface';
import RequestResponseAlert from './interfaces/request-response-alert.interface';

@ObjectType({
  implements: () => [RequestResponseAlert],
})
export default class RequestAcceptedAlert implements RequestResponseAlert {
  requestId: number;
  request: Request;
  id: number;
  createdBy: User;
  createdById: number;
  isCreator: boolean;
  recipients: User[];
  createdAt: Date;
}
