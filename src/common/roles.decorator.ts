import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const MemberRoles = (...roles: Role[]) => SetMetadata('roles', roles);
