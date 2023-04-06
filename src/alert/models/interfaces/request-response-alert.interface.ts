import { Field, InterfaceType } from '@nestjs/graphql';
import { Alert as PrimsaAlert } from '@prisma/client';
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
  @Field()
  request: Request;

  @Field(() => HashIdScalar)
  requestId: number;

  id: number;
  createdBy: User;
  createdById: number;
  isCreator: boolean;
  recipients: User[];
  createdAt: Date;
}
