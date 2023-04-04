import { Field, InterfaceType } from '@nestjs/graphql';
import { Chat as PrismaChat } from '@prisma/client';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import User from 'src/user/models/interfaces/user.interface';
import GroupChat from '../../group-chat/models/group-chat.model';
import DeletedChat from 'src/chat/deleted-chat/models/deleted-chat.model';
import { DirectMessageChat } from 'src/chat/direct-message-chat/models/direct-messge-chat.model';

@InterfaceType({
  resolveType: (value: PrismaChat) => {
    if (value.deletedAt) {
      return DeletedChat;
    }

    switch (value.type) {
      case 'GROUP':
        return GroupChat;
      case 'DIRECT_MESSAGE':
        return DirectMessageChat;
      default:
        return null;
    }
  },
})
export default abstract class Chat {
  @Field(() => HashIdScalar)
  id: number;

  @Field(() => User)
  createdBy: User;

  @Field(() => HashIdScalar)
  createdById: number;

  @Field()
  isCreator: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
