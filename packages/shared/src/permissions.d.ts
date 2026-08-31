export declare const PERMISSIONS: readonly ["products.read", "products.write", "orders.read", "orders.write", "orders.refund", "customers.read", "customers.write", "finance.read", "finance.write", "finance.payout", "store.write", "checkout.write", "analytics.read", "affiliates.manage", "courses.write", "marketing.write", "support.manage", "team.manage", "settings.manage", "ai.use"];
export type Permission = (typeof PERMISSIONS)[number];
export declare const ROLE_TEMPLATES: Record<string, Permission[]>;
//# sourceMappingURL=permissions.d.ts.map