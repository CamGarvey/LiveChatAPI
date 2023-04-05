import { Field, ObjectType } from '@nestjs/graphql';
import Event from 'src/event/models/interfaces/event.interface';
import User from 'src/user/models/interfaces/user.interface';

@ObjectType()
export default class Message {
  @Field()
  content: string;

  @Field(() => [User])
  likedBy: User[];

  @Field(() => Event)
  event: Event;

  @Field()
  eventId: number;
}
