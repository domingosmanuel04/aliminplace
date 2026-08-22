import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../common/decorators';
import { ctx } from '../../common/als';

@ApiTags('misc')
@Controller()
export class MiscController {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  @Public()
  @Get('marketplace')
  marketplace(@Query() q: any) {
    return this.prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        marketplaceVisible: true,
        type: q.type || undefined,
        price: {
          gte: q.min ? Number(q.min) : undefined,
          lte: q.max ? Number(q.max) : undefined,
        },
      },
      include: { media: true, store: true, category: true },
      orderBy: q.sort === 'new' ? { publishedAt: 'desc' } : { salesCount: 'desc' },
      take: 48,
    });
  }

  @Public()
  @Get('health')
  health() {
    return { ok: true, service: 'trauner-api', time: new Date().toISOString() };
  }

  @Get('notifications')
  notifications() {
    return this.prisma.notification.findMany({
      where: { userId: ctx().userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  @Post('notifications/:id/read')
  async read(@Param('id') id: string) {
    return this.prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }

  @Get('tickets')
  tickets() {
    return this.prisma.ticket.findMany({
      where: { OR: [{ authorId: ctx().userId }, { tenantId: ctx().tenantId }] },
      include: { replies: true, author: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('tickets')
  createTicket(@Body() body: any) {
    return this.prisma.ticket.create({
      data: {
        tenantId: ctx().tenantId || body.tenantId,
        authorId: ctx().userId!,
        subject: body.subject,
        replies: { create: { authorId: ctx().userId!, body: body.body } },
      },
    });
  }

  @Post('tickets/:id/replies')
  reply(@Param('id') id: string, @Body() body: any) {
    return this.prisma.ticketReply.create({
      data: { ticketId: id, authorId: ctx().userId!, body: body.body },
    });
  }

  @Get('team')
  team() {
    return this.prisma.teamMember.findMany({
      where: { tenantId: ctx().tenantId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  @Post('team')
  async invite(@Body() body: { email: string; role: any; permissions?: string[] }) {
    let user = await this.prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: body.email.toLowerCase(),
          name: body.email.split('@')[0],
          passwordHash: await (await import('argon2')).hash('Convite@123!', { type: 2 }),
        },
      });
    }
    return this.prisma.teamMember.upsert({
      where: { tenantId_userId: { tenantId: ctx().tenantId!, userId: user.id } },
      update: { role: body.role, permissions: body.permissions || [] },
      create: { tenantId: ctx().tenantId!, userId: user.id, role: body.role, permissions: body.permissions || [] },
    });
  }

  @Get('webhooks')
  webhooks() {
    return this.prisma.webhook.findMany({ where: { tenantId: ctx().tenantId }, include: { deliveries: { take: 10, orderBy: { createdAt: 'desc' } } } });
  }

  @Post('webhooks')
  createWebhook(@Body() body: any) {
    return this.prisma.webhook.create({
      data: {
        tenantId: ctx().tenantId!,
        url: body.url,
        secret: body.secret || `whsec_${Math.random().toString(36).slice(2)}`,
        events: body.events || [],
      },
    });
  }

  @Post('webhooks/deliveries/:id/replay')
  async replay(@Param('id') id: string) {
    const d = await this.prisma.webhookDelivery.update({
      where: { id },
      data: { attempts: { increment: 1 }, lastError: 'replayed' },
    });
    return d;
  }

  @Get('inventory')
  inventory() {
    return this.prisma.inventory.findMany({
      where: { warehouse: { tenantId: ctx().tenantId } },
      include: { product: true, warehouse: true, variant: true },
    });
  }

  @Post('inventory/adjust')
  async adjust(@Body() body: { inventoryId: string; quantity: number; reason?: string }) {
    const inv = await this.prisma.inventory.update({
      where: { id: body.inventoryId },
      data: { quantity: body.quantity },
    });
    await this.prisma.inventoryMovement.create({
      data: { inventoryId: inv.id, type: 'ADJUSTMENT', quantity: body.quantity, reason: body.reason },
    });
    return inv;
  }

  @Get('reviews')
  reviews() {
    return this.prisma.review.findMany({
      where: { product: { tenantId: ctx().tenantId } },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('reviews/:id/moderate')
  moderate(@Param('id') id: string, @Body() body: { moderated: boolean }) {
    return this.prisma.review.update({ where: { id }, data: { moderated: body.moderated } });
  }

  @Public()
  @Post('reviews')
  createReview(@Body() body: any) {
    return this.prisma.review.create({
      data: {
        productId: body.productId,
        storeId: body.storeId,
        userId: ctx().userId,
        rating: body.rating,
        comment: body.comment,
        verified: false,
        moderated: false,
      },
    });
  }

  @Get('account/orders')
  async myOrders() {
    const user = await this.prisma.user.findUnique({ where: { id: ctx().userId } });
    return this.prisma.order.findMany({
      where: { customer: { email: user?.email } },
      include: { items: true, store: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('subscriptions')
  subscriptions() {
    return this.prisma.subscription.findMany({
      where: { tenantId: ctx().tenantId },
      include: { customer: true, plan: true },
    });
  }

  @Post('subscriptions/:id/cancel')
  cancelSub(@Param('id') id: string) {
    return this.prisma.subscription.update({
      where: { id },
      data: { cancelAtPeriodEnd: true, cancelledAt: new Date(), status: 'CANCELLED' },
    });
  }

  @Get('shipping')
  shipping(@Query('storeId') storeId: string) {
    return this.prisma.shippingMethod.findMany({ where: { storeId, active: true } });
  }

  @Post('domains')
  domains(@Body() body: any) {
    return this.prisma.domain.create({
      data: {
        tenantId: ctx().tenantId!,
        storeId: body.storeId,
        host: body.host,
        txtToken: `trauner-verify-${Math.random().toString(36).slice(2, 8)}`,
        isSubdomain: !body.host.includes('.'),
      },
    });
  }

  @Post('domains/:id/verify')
  verifyDomain(@Param('id') id: string) {
    return this.prisma.domain.update({
      where: { id },
      data: { status: 'ACTIVE', verifiedAt: new Date(), sslIssuedAt: new Date() },
    });
  }
}
