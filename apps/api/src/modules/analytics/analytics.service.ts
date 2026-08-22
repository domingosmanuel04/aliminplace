import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { requireTenantId } from '../../common/als';
import { money, startOfDay, startOfMonth, startOfYear } from '../../common/util';

@Injectable()
export class AnalyticsService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async dashboard() {
    const tenantId = requireTenantId();
    const now = new Date();
    const today = startOfDay(now);
    const yesterday = startOfDay(new Date(today.getTime() - 86400000));
    const month = startOfMonth(now);
    const prevMonth = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const year = startOfYear(now);
    const prevYear = startOfYear(new Date(now.getFullYear() - 1, 0, 1));

    const paid = { tenantId, status: { in: ['PAID', 'PROCESSING', 'PICKED', 'SHIPPED', 'DELIVERED'] as any } };

    const [todayOrders, yesterdayOrders, monthOrders, prevMonthOrders, yearOrders, prevYearOrders] = await Promise.all([
      this.prisma.order.findMany({ where: { ...paid, createdAt: { gte: today } } }),
      this.prisma.order.findMany({ where: { ...paid, createdAt: { gte: yesterday, lt: today } } }),
      this.prisma.order.findMany({ where: { ...paid, createdAt: { gte: month } } }),
      this.prisma.order.findMany({ where: { ...paid, createdAt: { gte: prevMonth, lt: month } } }),
      this.prisma.order.findMany({ where: { ...paid, createdAt: { gte: year } } }),
      this.prisma.order.findMany({ where: { ...paid, createdAt: { gte: prevYear, lt: year } } }),
    ]);

    const sum = (os: typeof todayOrders) => os.reduce((s, o) => s + money(o.total), 0);
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    const [customers, products, subscriptions, affiliates, commissions] = await Promise.all([
      this.prisma.customer.count({ where: { tenantId } }),
      this.prisma.product.count({ where: { tenantId, status: 'PUBLISHED' } }),
      this.prisma.subscription.count({ where: { tenantId, status: 'ACTIVE' } }),
      this.prisma.affiliate.count({ where: { tenantId } }),
      this.prisma.commission.aggregate({ where: { order: { tenantId } }, _sum: { amount: true } }),
    ]);

    const views = await this.prisma.trackingEvent.count({
      where: { name: 'PRODUCT_VIEW', createdAt: { gte: month }, storeId: { in: (await this.prisma.store.findMany({ where: { tenantId }, select: { id: true } })).map((s) => s.id) } },
    });
    const checkouts = await this.prisma.trackingEvent.count({
      where: { name: 'INITIATE_CHECKOUT', createdAt: { gte: month } },
    });
    const purchases = monthOrders.length;
    const conversion = views ? (purchases / views) * 100 : 0;

    const byDay = await this.series(tenantId, month);
    const byProduct = await this.byProduct(tenantId, month);
    const byDevice = this.group(monthOrders, (o) => o.device || 'unknown');
    const byCountry = this.group(monthOrders, (o) => o.country || 'AO');
    const payments = await this.prisma.payment.findMany({
      where: { order: { tenantId }, status: 'APPROVED', createdAt: { gte: month } },
    });
    const byMethod = this.group(payments, (p) => p.method);

    return {
      kpis: {
        revenueToday: sum(todayOrders),
        revenueYesterday: sum(yesterdayOrders),
        revenueMonth: sum(monthOrders),
        revenuePrevMonth: sum(prevMonthOrders),
        revenueYear: sum(yearOrders),
        revenuePrevYear: sum(prevYearOrders),
        salesToday: todayOrders.length,
        salesMonth: monthOrders.length,
        avgTicket: monthOrders.length ? sum(monthOrders) / monthOrders.length : 0,
        conversion,
        customers,
        products,
        subscriptions,
        affiliates,
        commissions: money(commissions._sum.amount || 0),
        walletAvailable: money(tenant?.walletAvailable || 0),
        walletPending: money(tenant?.walletPending || 0),
        checkoutStarts: checkouts,
        cartAbandon: Math.max(0, checkouts - purchases),
      },
      charts: { byDay, byProduct, byDevice, byCountry, byMethod },
    };
  }

  async insights() {
    const d = await this.dashboard();
    const notes: string[] = [];
    const { kpis } = d;
    if (kpis.revenueYesterday) {
      const delta = ((kpis.revenueToday - kpis.revenueYesterday) / kpis.revenueYesterday) * 100;
      notes.push(`As vendas de hoje estão ${delta >= 0 ? 'acima' : 'abaixo'} ${Math.abs(delta).toFixed(1)}% em relação a ontem.`);
    }
    if (kpis.revenuePrevMonth) {
      const delta = ((kpis.revenueMonth - kpis.revenuePrevMonth) / kpis.revenuePrevMonth) * 100;
      notes.push(`O faturamento deste mês ${delta >= 0 ? 'cresceu' : 'caiu'} ${Math.abs(delta).toFixed(1)}% vs. o mês anterior.`);
    }
    if (kpis.conversion < 2 && kpis.checkoutStarts > 5) {
      notes.push('O checkout possui abandono elevado. Simplifique o formulário e adicione prova social.');
    }
    if (d.charts.byProduct[0]) {
      notes.push(`O produto com melhor desempenho é "${d.charts.byProduct[0].name}".`);
    }
    const hour = new Date().getHours();
    if (hour >= 18 && hour <= 21) notes.push('O melhor horário de vendas costuma ser entre 18h e 21h — aumente o remarketing agora.');
    return { notes, kpis: d.kpis };
  }

  private async series(tenantId: string, from: Date) {
    const orders = await this.prisma.order.findMany({
      where: { tenantId, status: { in: ['PAID', 'PROCESSING', 'PICKED', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: from } },
    });
    const map = new Map<string, number>();
    for (const o of orders) {
      const k = o.createdAt.toISOString().slice(0, 10);
      map.set(k, (map.get(k) || 0) + money(o.total));
    }
    return [...map.entries()].map(([date, total]) => ({ date, total }));
  }

  private async byProduct(tenantId: string, from: Date) {
    const items = await this.prisma.orderItem.findMany({
      where: { order: { tenantId, createdAt: { gte: from }, status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } } },
    });
    const map = new Map<string, { name: string; total: number }>();
    for (const i of items) {
      const cur = map.get(i.productId) || { name: i.name, total: 0 };
      cur.total += money(i.total);
      map.set(i.productId, cur);
    }
    return [...map.values()].sort((a, b) => b.total - a.total).slice(0, 8);
  }

  private group<T>(rows: T[], key: (r: T) => string) {
    const map = new Map<string, number>();
    for (const r of rows) map.set(key(r), (map.get(key(r)) || 0) + 1);
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }
}
