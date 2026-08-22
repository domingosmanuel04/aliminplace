import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { money } from '../../common/util';

@Injectable()
export class AdminService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async overview() {
    const [users, tenants, products, orders, payouts, tickets] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.tenant.count(),
      this.prisma.product.count(),
      this.prisma.order.findMany({ where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } } }),
      this.prisma.payout.findMany({ where: { status: { in: ['REQUESTED', 'REVIEWING'] } } }),
      this.prisma.ticket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    ]);
    const gmv = orders.reduce((s, o) => s + money(o.total), 0);
    const fees = await this.prisma.walletTx.aggregate({ where: { type: 'FEE' }, _sum: { amount: true } });
    return {
      users,
      tenants,
      sellers: await this.prisma.tenant.count({ where: { status: 'ACTIVE' } }),
      products,
      orders: orders.length,
      gmv,
      platformRevenue: money(fees._sum.amount || 0),
      pendingPayouts: payouts.length,
      openTickets: tickets,
      reports: await this.prisma.report.count({ where: { status: 'OPEN' } }),
    };
  }

  tenants() {
    return this.prisma.tenant.findMany({ include: { owner: true, stores: true }, orderBy: { createdAt: 'desc' } });
  }

  async setTenantStatus(id: string, status: any) {
    return this.prisma.tenant.update({ where: { id }, data: { status } });
  }

  async setUserStatus(id: string, status: any) {
    return this.prisma.user.update({ where: { id }, data: { status } });
  }

  fees() {
    return this.prisma.platformFee.findMany();
  }

  async saveFee(id: string, data: any) {
    return this.prisma.platformFee.update({ where: { id }, data });
  }

  async decidePayout(id: string, status: any, note?: string) {
    const p = await this.prisma.payout.update({
      where: { id },
      data: { status, reviewNote: note, processedAt: status === 'COMPLETED' ? new Date() : undefined },
    });
    if (status === 'REJECTED') {
      await this.prisma.tenant.update({
        where: { id: p.tenantId },
        data: { walletAvailable: { increment: p.amount } },
      });
    }
    return p;
  }

  payouts() {
    return this.prisma.payout.findMany({ include: { tenant: true }, orderBy: { createdAt: 'desc' } });
  }

  logs() {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  }

  reports() {
    return this.prisma.report.findMany({ include: { reporter: true }, orderBy: { createdAt: 'desc' } });
  }

  users() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 200, select: { id: true, email: true, name: true, status: true, isSuperAdmin: true, createdAt: true } });
  }
}
