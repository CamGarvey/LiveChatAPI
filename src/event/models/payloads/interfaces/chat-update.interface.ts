import { Field, ID, InterfaceType } from '@nestjs/graphql';
import { ChatUpdate as PrismaChatUpdate } from '@prisma/client';
import Chat from 'src/chat/models/interfaces/chat.interfaces';
import User from 'src/user/models/interfaces/user.interface';

@InterfaceType({
  resolveType: (value: PrismaChatUpdate) => {
    switch (value.type) {
      case 'NAME_UPDATED':
        return null;
    }
  },
})
export default abstract class ChatUpdate {}
