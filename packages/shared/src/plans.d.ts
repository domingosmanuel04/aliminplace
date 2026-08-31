export type PlanKey = 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
export interface PlanLimits {
    products: number;
    monthlySales: number;
    storageMb: number;
    teamMembers: number;
    domains: number;
    ai: boolean;
    automations: boolean;
    affiliates: boolean;
    customCheckout: boolean;
    analyticsAdvanced: boolean;
}
export declare const PLANS: Record<PlanKey, {
    name: string;
    priceMonthlyAoa: number;
    limits: PlanLimits;
}>;
//# sourceMappingURL=plans.d.ts.map