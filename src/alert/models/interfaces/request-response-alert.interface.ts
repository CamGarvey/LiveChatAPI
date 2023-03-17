import { Field, ID, InterfaceType } from '@nestjs/graphql';
import { Alert as PrimsaAlert, AlertType } from '@prisma/client';
import Request from 'src/request/models/interfaces/request.interface';
import User from 'src/user/models/interfaces/user.interface';
import Alert from './alert.interface';

@InterfaceType({
  implements: () => Alert,
  resolveType: (source: PrimsaAlert) => {
    return source.type;
  },
})
export default class RequestResponseAlert implements Alert {
  @Field()
  requestId: number;

  @Field()
  request: Request;

  id: number;
  createdBy: User;
  createdById: number;
  isCreator: boolean;
  recipient: User;
  recipientId: number;
  createdAt: Date;
}
