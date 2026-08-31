"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYMENT_METHODS = exports.PAYMENT_STATUSES = exports.ORDER_STATUSES = exports.PRODUCT_TYPES = void 0;
exports.PRODUCT_TYPES = [
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
];
exports.ORDER_STATUSES = [
    'AWAITING_PAYMENT',
    'PAID',
    'PROCESSING',
    'PICKED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
];
exports.PAYMENT_STATUSES = [
    'PENDING',
    'AUTHORIZED',
    'APPROVED',
    'FAILED',
    'REFUNDED',
    'PARTIALLY_REFUNDED',
    'CHARGED_BACK',
];
exports.PAYMENT_METHODS = [
    'CARD',
    'TRANSFER',
    'REFERENCE',
    'PIX',
    'WALLET',
    'CASH_ON_DELIVERY',
];
//# sourceMappingURL=enums.js.map