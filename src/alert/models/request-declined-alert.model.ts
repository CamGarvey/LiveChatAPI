import { ObjectType } from '@nestjs/graphql';
import { AlertType } from '@prisma/client';
import Request from 'src/request/models/interfaces/request.interface';
import User from 'src/user/models/interfaces/user.interface';
import RequestResponseAlert from './interfaces/request-response-alert.interface';
import Alert from './interfaces/alert.interface';

@ObjectType({
  implements: () => [RequestResponseAlert, Alert],
})
export default class RequestDeclinedAlert implements RequestResponseAlert {
  requestId: number;
  request: Request;
  id: number;
  createdBy: User;
  createdById: number;
  isCreator: boolean;
  recipients: User[];
  createdAt: Date;
  type: AlertType;
  chatId: number;
}
