export const PRODUCT_TYPES = [
  'COURSE',
  'EBOOK',
  'FILE',
  'VIDEO',
  'AUDIO',
  'SOFTWARE',
  'SUBSCRIPTION',
  'COMMUNITY',
  'MENTORSHIP',
  'SERVICE',
  'PHYSICAL',
] as const;

export const ORDER_STATUSES = [
  'AWAITING_PAYMENT',
  'PAID',
  'PROCESSING',
  'PICKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
] as const;

export const PAYMENT_STATUSES = [
  'PENDING',
  'AUTHORIZED',
  'APPROVED',
  'FAILED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
  'CHARGED_BACK',
] as const;

export const PAYMENT_METHODS = [
  'CARD',
  'TRANSFER',
  'REFERENCE',
  'PIX',
  'WALLET',
  'CASH_ON_DELIVERY',
] as const;
