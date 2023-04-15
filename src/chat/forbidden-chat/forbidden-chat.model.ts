import { ObjectType } from '@nestjs/graphql';
import Chat from '../chat.interface';
import User from 'src/user/models/interfaces/user.interface';

@ObjectType({
  implements: () => Chat,
  description: 'A chat you do not have access to',
})
export class ForbiddenChat implements Chat {
  id: number;
  createdBy: User;
  createdById: number;
  isCreator: boolean;
  createdAt: Date;
  updatedAt: Date;
}
