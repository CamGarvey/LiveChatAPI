import { ObjectType } from '@nestjs/graphql';
import User from 'src/user/models/interfaces/user.interface';
import Request from '../../models/interfaces/request.interface';
import { RequestState } from '@prisma/client';

@ObjectType({
  implements: () => Request,
})
export class FriendRequest implements Request {
  id: number;
  createdBy: User;
  createdById: number;
  isCreator: boolean;
  recipient: User;
  recipientId: number;
  state: RequestState;
  createdAt: Date;
}
