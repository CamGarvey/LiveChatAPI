import { Field, ID, InterfaceType } from '@nestjs/graphql';
import { Alert as PrimsaAlert } from '@prisma/client';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import User from 'src/user/models/interfaces/user.interface';
import ChatDeletedAlert from '../chat-deleted-alert.model';
import ChatMemberAccessGrantedAlert from '../chat-member-access-granted-alert.model';
import ChatMemberAccessRevokedAlert from '../chat-member-access-revoked-alert.model';
import FriendDeletedAlert from '../friend-deleted-alert.model';
import RequestAcceptedAlert from '../request-accepted-alert.model';
import RequestDeclinedAlert from '../request-declined-alert.model';

@InterfaceType({
  resolveType: (source: PrimsaAlert) => {
    switch (source.type) {
      case 'CHAT_DELETED':
        return ChatDeletedAlert;
      case 'FRIEND_DELETED':
        return FriendDeletedAlert;
      case 'REQUEST_ACCEPTED':
        return RequestAcceptedAlert;
      case 'REQUEST_DECLINED':
        return RequestDeclinedAlert;
      case 'CHAT_ACCESS_REVOKED':
        return ChatMemberAccessRevokedAlert;
      case 'CHAT_ACCESS_GRANTED':
        return ChatMemberAccessGrantedAlert;
      case 'CHAT_ROLE_CHANGED':
        return 'ChatRoleChanged';
      default:
        return null;
    }
  },
})
export default class Alert {
  @Field(() => HashIdScalar)
  id: number;

  @Field(() => User)
  createdBy: User;

  @Field(() => HashIdScalar)
  createdById: number;

  @Field()
  isCreator: boolean;

  @Field(() => User)
  recipient: User;

  @Field(() => HashIdScalar)
  recipientId: number;

  @Field(() => Date)
  createdAt: Date;
}
