import { Field, ID, InterfaceType } from '@nestjs/graphql';
import { Alert as PrimsaAlert, AlertType } from '@prisma/client';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
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
  @Field(() => HashIdScalar)
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
