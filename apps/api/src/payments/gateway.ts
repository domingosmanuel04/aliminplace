export interface ChargeInput {
  amount: number;
  currency: string;
  method: 'CARD' | 'TRANSFER' | 'REFERENCE' | 'PIX' | 'WALLET' | 'CASH_ON_DELIVERY';
  token?: string;
  holderName?: string;
  metadata?: Record<string, string>;
}

export interface ChargeResult {
  status: 'APPROVED' | 'PENDING' | 'FAILED';
  provider: string;
  providerRef: string;
  referenceCode?: string;
  last4?: string;
  brand?: string;
  failureReason?: string;
}

export interface PaymentGateway {
  charge(input: ChargeInput): Promise<ChargeResult>;
  confirm(providerRef: string): Promise<ChargeResult>;
  refund(providerRef: string, amount: number): Promise<void>;
}
