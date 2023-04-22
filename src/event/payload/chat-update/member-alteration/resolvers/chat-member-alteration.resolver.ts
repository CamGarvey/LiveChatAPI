import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import MemberAlteration from '../models/interface/member-alteration.interface';
import { ChatUpdateService } from '../../services/chat-update.service';

@Resolver(() => MemberAlteration)
export class MemberAlterationResolver {
  constructor(private readonly chatUpdateService: ChatUpdateService) {}

  @ResolveField()
  async members(@Parent() parent: MemberAlteration) {
    return await this.chatUpdateService.getChatUpdate(parent.eventId).members();
  }
}
