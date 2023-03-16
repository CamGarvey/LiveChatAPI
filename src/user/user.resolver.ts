import { Resolver, Args, ResolveField, Parent, Info } from '@nestjs/graphql';
import User from './user.model';

@Resolver((type) => User) // Reminder: Character is an interface
export class UserInterfaceResolver {
  // @ResolveField(() => [User])
  // blah(
  //   @Parent() character, // Resolved object that implements Character
  //   @Info() { parentType }, // Type of the object that implements Character
  //   @Args('search', { type: () => String }) searchTerm: string,
  // ) {
  //   // Get character's friends
  //   return [];
  // }
}
