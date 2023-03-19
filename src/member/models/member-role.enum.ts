import { registerEnumType } from '@nestjs/graphql';

export enum MemberRole {
  Basic,
  Admin,
  Owner,
}

registerEnumType(MemberRole, {
  name: 'MemberRole',
});
