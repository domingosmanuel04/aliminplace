import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ctx } from '../../common/als';
import { slugify } from '../../common/util';
import { randomBytes } from 'node:crypto';

@Injectable()
export class AffiliateService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async marketplace(q: { category?: string; minCommission?: number }) {
    return this.prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        affiliateEnabled: true,
        affiliateCommission: q.minCommission ? { gte: q.minCommission } : undefined,
      },
      include: { media: true, store: true },
      take: 50,
      orderBy: { salesCount: 'desc' },
    });
  }

  async apply(productId: string, userId: string) {
    let aff = await this.prisma.affiliate.findUnique({ where: { userId } });
    if (!aff) {
      aff = await this.prisma.affiliate.create({
        data: { userId, code: `AFF${randomBytes(3).toString('hex').toUpperCase()}`, status: 'APPROVED' },
      });
    }
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    const status = product?.affiliateAutoApprove ? 'APPROVED' : 'PENDING';
    return this.prisma.affiliateLink.upsert({
      where: { code: `${aff.code}-${slugify(product?.name || 'p')}` },
      update: {},
      create: {
        affiliateId: aff.id,
        productId,
        code: `${aff.code}-${slugify(product?.name || 'p')}-${randomBytes(2).toString('hex')}`,
        status: status as any,
      },
    });
  }

  async trackClick(code: string, ip?: string, ua?: string) {
    const link = await this.prisma.affiliateLink.findUnique({ where: { code } });
    if (!link || link.status !== 'APPROVED') return { ok: false };
    await this.prisma.affiliateLink.update({ where: { id: link.id }, data: { clicks: { increment: 1 } } });
    await this.prisma.affiliateClick.create({ data: { linkId: link.id, ip, userAgent: ua } });
    return { ok: true, affiliateId: link.affiliateId, productId: link.productId };
  }

  async me(userId: string) {
    const aff = await this.prisma.affiliate.findUnique({
      where: { userId },
      include: { links: { include: { product: true } }, sales: true, commissions: true },
    });
    return aff;
  }

  async producerLinks() {
    const tenantId = ctx().tenantId!;
    return this.prisma.affiliateLink.findMany({
      where: { product: { tenantId } },
      include: { affiliate: { include: { user: true } }, product: true },
    });
  }

  async decide(linkId: string, status: 'APPROVED' | 'BLOCKED') {
    return this.prisma.affiliateLink.update({ where: { id: linkId }, data: { status } });
  }
}
