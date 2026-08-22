import { AsyncLocalStorage } from 'node:async_hooks';

export type RequestContext = {
  userId?: string;
  tenantId?: string;
  storeId?: string;
  isSuperAdmin?: boolean;
  permissions?: string[];
  role?: string;
};

export const als = new AsyncLocalStorage<RequestContext>();

export function ctx(): RequestContext {
  return als.getStore() || {};
}

export function requireTenantId(): string {
  const id = ctx().tenantId;
  if (!id) throw Object.assign(new Error('Tenant required'), { status: 400 });
  return id;
}
