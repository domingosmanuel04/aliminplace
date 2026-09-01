export declare const WEBHOOK_EVENTS: readonly ["payment.created", "payment.approved", "payment.failed", "payment.refunded", "order.created", "order.shipped", "order.delivered", "subscription.created", "subscription.renewed", "subscription.cancelled", "affiliate.sale", "payout.completed"];
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];
export declare const MARKETING_EVENTS: readonly ["PAGE_VIEW", "PRODUCT_VIEW", "ADD_TO_CART", "INITIATE_CHECKOUT", "PURCHASE", "SUBSCRIPTION", "REFUND", "CANCEL"];
export type MarketingEvent = (typeof MARKETING_EVENTS)[number];
//# sourceMappingURL=events.d.ts.map