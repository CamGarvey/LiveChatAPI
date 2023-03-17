import { ObjectType } from '@nestjs/graphql';
import { AlertType } from '@prisma/client';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import Request from 'src/request/models/interfaces/request.interface';
import KnownUser from 'src/user/models/interfaces/known-user.interface';
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
  recipient: User;
  recipientId: number;
  createdAt: Date;
}
