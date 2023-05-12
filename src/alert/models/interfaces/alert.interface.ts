import { Field, InterfaceType } from '@nestjs/graphql';
import { Alert as PrimsaAlert } from '@prisma/client';
import ChatMemberAccessGrantedAlert from 'src/alert/chat-alert/models/chat-member-access-granted-alert.model';
import ChatMemberAccessRevokedAlert from 'src/alert/chat-alert/models/chat-member-access-revoked-alert.model';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import User from 'src/user/models/interfaces/user.interface';
import ChatDeletedAlert from '../../chat-alert/models/chat-deleted-alert.model';
import FriendDeletedAlert from '../friend-deleted-alert.model';

@InterfaceType({
  resolveType: (source: PrimsaAlert) => {
    switch (source.type) {
      case 'CHAT_DELETED':
        return ChatDeletedAlert;
      case 'FRIEND_DELETED':
        return FriendDeletedAlert;
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

  @Field(() => [User])
  recipients: User[];

  @Field(() => Date)
  createdAt: Date;
}
