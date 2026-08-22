import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { requireTenantId } from '../../common/als';
import { money } from '../../common/util';
import { AuditService } from '../../common/audit.service';

@Injectable()
export class FinanceService {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(AuditService) private audit: AuditService,
  ) {}

  async wallet() {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: requireTenantId() } });
    const txs = await this.prisma.walletTx.findMany({
      where: { tenantId: tenant!.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return {
      available: money(tenant!.walletAvailable),
      pending: money(tenant!.walletPending),
      statement: txs,
    };
  }

  async requestPayout(amount: number, method: string, destination: any) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: requireTenantId() } });
    if (money(tenant!.walletAvailable) < amount) throw new BadRequestException('Saldo insuficiente');
    if (tenant!.kycStatus !== 'APPROVED' && amount > 100000) {
      throw new BadRequestException('KYC necessário para saques acima de 100.000 Kz');
    }
    const payout = await this.prisma.payout.create({
      data: { tenantId: tenant!.id, amount, method, destination, status: 'REQUESTED' },
    });
    await this.prisma.tenant.update({
      where: { id: tenant!.id },
      data: { walletAvailable: { decrement: amount } },
    });
    await this.prisma.walletTx.create({
      data: {
        tenantId: tenant!.id,
        type: 'PAYOUT',
        direction: 'DEBIT',
        amount,
        balanceAfter: money(tenant!.walletAvailable) - amount,
        description: `Saque ${payout.id.slice(-6)}`,
        available: true,
      },
    });
    await this.audit.log('payout.request', 'Payout', payout.id, { amount });
    return payout;
  }

  async listPayouts() {
    return this.prisma.payout.findMany({ where: { tenantId: requireTenantId() }, orderBy: { createdAt: 'desc' } });
  }
}
