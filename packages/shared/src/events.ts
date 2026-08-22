export const WEBHOOK_EVENTS = [
  'payment.created',
  'payment.approved',
  'payment.failed',
  'payment.refunded',
  'order.created',
  'order.shipped',
  'order.delivered',
  'subscription.created',
  'subscription.renewed',
  'subscription.cancelled',
  'affiliate.sale',
  'payout.completed',
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export const MARKETING_EVENTS = [
  'PAGE_VIEW',
  'PRODUCT_VIEW',
  'ADD_TO_CART',
  'INITIATE_CHECKOUT',
  'PURCHASE',
  'SUBSCRIPTION',
  'REFUND',
  'CANCEL',
] as const;

export type MarketingEvent = (typeof MARKETING_EVENTS)[number];
