import {
  Field,
  InterfaceType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import User from 'src/user/models/interfaces/user.interface';

@InterfaceType()
export default abstract class Member {}
