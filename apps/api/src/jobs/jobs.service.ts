import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService {
  private log = new Logger('Jobs');
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  @Cron('*/15 * * * *')
  async releaseWallet() {
    const due = await this.prisma.walletTx.findMany({
      where: { available: false, availableAt: { lte: new Date() }, type: 'SALE' },
    });
    for (const tx of due) {
      await this.prisma.walletTx.update({ where: { id: tx.id }, data: { available: true } });
      await this.prisma.tenant.update({
        where: { id: tx.tenantId },
        data: { walletAvailable: { increment: tx.amount }, walletPending: { decrement: tx.amount } },
      });
    }
    if (due.length) this.log.log(`Released ${due.length} wallet txs`);
  }

  @Cron('*/10 * * * *')
  async abandonCarts() {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    const carts = await this.prisma.cart.findMany({
      where: { convertedAt: null, abandonedAt: null, updatedAt: { lt: cutoff }, items: { some: {} } },
      include: { items: true, store: true },
    });
    for (const cart of carts) {
      await this.prisma.cart.update({ where: { id: cart.id }, data: { abandonedAt: new Date(), reminderStep: 1 } });
      await this.prisma.emailJob.create({
        data: {
          to: 'guest@cart.local',
          template: 'cart_abandoned_30m',
          payload: { cartId: cart.id, store: cart.store.name },
          sentAt: new Date(),
        },
      });
    }
  }

  @Cron('0 8 * * *')
  async dunning() {
    const due = await this.prisma.subscription.findMany({
      where: { status: 'ACTIVE', currentPeriodEnd: { lte: new Date() } },
    });
    for (const s of due) {
      await this.prisma.subscription.update({
        where: { id: s.id },
        data: { status: 'PAST_DUE', dunningStep: { increment: 1 } },
      });
      await this.prisma.emailJob.create({
        data: { to: 'billing@local', template: 'dunning', payload: { subscriptionId: s.id }, sentAt: new Date() },
      });
    }
  }

  @Cron('0 3 * * *')
  async lowStock() {
    const low = await this.prisma.inventory.findMany({
      where: { minQuantity: { gt: 0 } },
      include: { product: true },
    });
    for (const i of low) {
      if (i.quantity <= i.minQuantity) {
        this.log.warn(`Low stock ${i.product.name}: ${i.quantity}`);
      }
    }
  }
}
