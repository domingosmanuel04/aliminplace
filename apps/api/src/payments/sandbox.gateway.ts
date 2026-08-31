import { Injectable } from "@nestjs/common";
import { randomInt, randomUUID } from "node:crypto";
import { ChargeInput, ChargeResult, PaymentGateway } from "./gateway";

@Injectable()
export class SandboxGateway implements PaymentGateway {
  async charge(input: ChargeInput): Promise<ChargeResult> {
    if (input.method === "CARD") {
      const fail =
        input.token?.startsWith("fail") || input.token === "4000000000000002";
      if (fail) {
        return {
          status: "FAILED",
          provider: "sandbox",
          providerRef: `sbx_${randomUUID()}`,
          failureReason: "Cartão recusado (sandbox)",
        };
      }
      return {
        status: "APPROVED",
        provider: "sandbox",
        providerRef: `sbx_${randomUUID()}`,
        last4: (input.token || "4242424242424242").slice(-4),
        brand: "visa",
      };
    }
    if (
      input.method === "REFERENCE" ||
      input.method === "TRANSFER" ||
      input.method === "PIX"
    ) {
      return {
        status: "PENDING",
        provider: "sandbox",
        providerRef: `sbx_${randomUUID()}`,
        referenceCode: String(randomInt(100000000, 999999999)),
      };
    }
    return {
      status: "APPROVED",
      provider: "sandbox",
      providerRef: `sbx_${randomUUID()}`,
    };
  }

  async confirm(providerRef: string): Promise<ChargeResult> {
    return { status: "APPROVED", provider: "sandbox", providerRef };
  }

  async refund(providerRef: string, amount: number): Promise<void> {
    void providerRef;
    void amount;
    return;
  }
}
