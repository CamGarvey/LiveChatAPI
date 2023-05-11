import { Field, InterfaceType } from '@nestjs/graphql';
import { Chat as PrismaChat } from '@prisma/client';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import User from 'src/user/models/interfaces/user.interface';
import GroupChat from './group-chat/group-chat.model';
import DeletedChat from 'src/chat/deleted-chat/deleted-chat.model';
import { DirectMessageChat } from 'src/chat/direct-message-chat/direct-messge-chat.model';
import { IContext } from 'src/auth/interfaces/context.interface';
import { ForbiddenChat } from './forbidden-chat/forbidden-chat.model';

@InterfaceType({
  resolveType: async (value: PrismaChat, { user }: IContext) => {
    if (value.deletedAt) {
      return DeletedChat;
    }
    const chats = await user.getChats();
    if (chats.has(value.id)) {
      switch (value.type) {
        case 'GROUP':
          return GroupChat;
        case 'DIRECT_MESSAGE':
          return DirectMessageChat;
        default:
          return null;
      }
    }
    return ForbiddenChat;
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
