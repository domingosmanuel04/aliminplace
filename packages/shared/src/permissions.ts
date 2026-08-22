export const PERMISSIONS = [
  'products.read',
  'products.write',
  'orders.read',
  'orders.write',
  'orders.refund',
  'customers.read',
  'customers.write',
  'finance.read',
  'finance.write',
  'finance.payout',
  'store.write',
  'checkout.write',
  'analytics.read',
  'affiliates.manage',
  'courses.write',
  'marketing.write',
  'support.manage',
  'team.manage',
  'settings.manage',
  'ai.use',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_TEMPLATES: Record<string, Permission[]> = {
  owner: [...PERMISSIONS],
  admin: PERMISSIONS.filter((p) => p !== 'finance.payout'),
  financeiro: [
    'orders.read',
    'customers.read',
    'finance.read',
    'finance.write',
    'finance.payout',
    'analytics.read',
  ],
  suporte: ['orders.read', 'customers.read', 'customers.write', 'support.manage'],
  marketing: [
    'products.read',
    'customers.read',
    'analytics.read',
    'marketing.write',
    'affiliates.manage',
    'ai.use',
  ],
  editor: ['products.read', 'products.write', 'courses.write', 'store.write', 'checkout.write'],
  vendedor: ['products.read', 'orders.read', 'orders.write', 'customers.read', 'customers.write'],
};
