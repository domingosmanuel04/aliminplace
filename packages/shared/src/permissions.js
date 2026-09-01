"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_TEMPLATES = exports.PERMISSIONS = void 0;
exports.PERMISSIONS = [
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
];
exports.ROLE_TEMPLATES = {
    owner: [...exports.PERMISSIONS],
    admin: exports.PERMISSIONS.filter((p) => p !== 'finance.payout'),
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
//# sourceMappingURL=permissions.js.map