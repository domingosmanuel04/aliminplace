import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC, true);

export const PERMS = 'perms';
export const RequirePerms = (...perms: string[]) => SetMetadata(PERMS, perms);

export const SUPER = 'super';
export const SuperAdmin = () => SetMetadata(SUPER, true);
