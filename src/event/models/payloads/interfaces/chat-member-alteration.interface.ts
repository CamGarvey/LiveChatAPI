import { InterfaceType } from '@nestjs/graphql';
import { ChatUpdate as PrismaChatUpdate } from '@prisma/client';
import ChatUpdate from './chat-update.interface';

@InterfaceType({
  implements: () => ChatUpdate,
  resolveType: (value: PrismaChatUpdate) => {
    switch (value.type) {
      case 'NAME_UPDATED':
        return null;
    }
  },
})
export default abstract class ChatMemberAlteration implements ChatUpdate {}
