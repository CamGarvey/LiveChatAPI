import { Field, InterfaceType } from '@nestjs/graphql';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import { HashIdScalar } from 'src/common/scalars/hash-id.scalar';
import User from 'src/user/models/interfaces/user.interface';
import { MemberRole } from '../member-role.enum';
import { Member as PrismaMember } from '@prisma/client';
import RemovedMember from '../removed-member.interface';
import ChatMember from '../chat-member.model';

@InterfaceType({
  resolveType: (source: PrismaMember) =>
    source.removedAt ? RemovedMember : ChatMember,
})
export default class Member {
  @Field(() => HashIdScalar)
  id: number;

  @Field(() => MemberRole)
  role: MemberRole;

  @Field(() => User)
  user: User;

  @Field(() => HashIdScalar)
  userId: number;

  @Field(() => Chat)
  chat: Chat;

  @Field(() => HashIdScalar)
  chatId: number;

  @Field(() => User)
  addedBy: User;

  @Field(() => HashIdScalar)
  addedById: number;
}
