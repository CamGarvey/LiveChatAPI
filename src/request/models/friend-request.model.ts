import { ObjectType } from '@nestjs/graphql';
import User from 'src/user/models/interfaces/user.interface';
import Request, { RequestState } from './interfaces/request.interface';

@ObjectType()
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
