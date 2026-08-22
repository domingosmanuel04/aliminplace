import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit.service';
import { ctx, requireTenantId } from '../../common/als';
import { slugify, money, addDays } from '../../common/util';
import { SandboxGateway } from '../../payments/sandbox.gateway';
import { ChargeInput } from '../../payments/gateway';

@Injectable()
export class CommerceService {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(AuditService) private audit: AuditService,
    @Inject(SandboxGateway) private gateway: SandboxGateway,
  ) {}

  tenant() {
    return requireTenantId();
  }

  async listStores() {
    return this.prisma.store.findMany({
      where: { tenantId: this.tenant() },
      include: { domains: true },
    });
  }

  async getStore(id: string) {
    return this.prisma.store.findFirstOrThrow({ where: { id, tenantId: this.tenant() } });
  }

  async updateStore(id: string, data: any) {
    const store = await this.prisma.store.update({
      where: { id },
      data: {
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        theme: data.theme,
        pages: data.pages,
        template: data.template,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        status: data.status,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
      },
    });
    await this.audit.log('store.update', 'Store', id, data);
    return store;
  }

  async publishStore(id: string) {
    return this.prisma.store.update({
      where: { id },
      data: { status: 'ACTIVE', publishedAt: new Date() },
    });
  }

  async listProducts(q: { search?: string; status?: string; type?: string }) {
    return this.prisma.product.findMany({
      where: {
        tenantId: this.tenant(),
        status: q.status as any,
        type: q.type as any,
        OR: q.search
          ? [
              { name: { contains: q.search, mode: 'insensitive' } },
              { sku: { contains: q.search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: { media: true, variants: true, category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProduct(data: any) {
    const tenantId = this.tenant();
    const store = await this.prisma.store.findFirst({ where: { tenantId } });
    if (!store) throw new BadRequestException('Crie uma loja primeiro');
    const product = await this.prisma.product.create({
      data: {
        tenantId,
        storeId: data.storeId || store.id,
        name: data.name,
        slug: data.slug || slugify(data.name),
        shortDescription: data.shortDescription,
        description: data.description,
        kind: data.kind || (data.type === 'PHYSICAL' ? 'PHYSICAL' : 'DIGITAL'),
        type: data.type,
        status: data.status || 'DRAFT',
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        sku: data.sku,
        trackInventory: data.trackInventory ?? data.type === 'PHYSICAL',
        tags: data.tags || [],
        categoryId: data.categoryId,
        weightGrams: data.weightGrams,
        warranty: data.warranty,
        returnPolicy: data.returnPolicy,
        affiliateEnabled: data.affiliateEnabled,
        affiliateCommission: data.affiliateCommission || 0,
        marketplaceVisible: data.marketplaceVisible ?? true,
        media: data.imageUrl ? { create: [{ url: data.imageUrl, type: 'image' }] } : undefined,
      },
      include: { media: true },
    });
    if (data.type === 'COURSE') {
      await this.prisma.course.create({ data: { productId: product.id, objectives: data.objectives || [] } });
    }
    if (data.type === 'SUBSCRIPTION') {
      await this.prisma.subscriptionPlan.create({
        data: {
          productId: product.id,
          name: 'Mensal',
          interval: 'month',
          price: data.price,
          trialDays: data.trialDays || 0,
        },
      });
    }
    await this.audit.log('product.create', 'Product', product.id);
    return product;
  }

  async updateProduct(id: string, data: any) {
    const existing = await this.prisma.product.findFirst({ where: { id, tenantId: this.tenant() } });
    if (!existing) throw new NotFoundException();
    if (data.price !== undefined && Number(data.price) !== money(existing.price)) {
      await this.audit.log('product.price_change', 'Product', id, { from: existing.price, to: data.price });
    }
    return this.prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        shortDescription: data.shortDescription,
        description: data.description,
        status: data.status,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        tags: data.tags,
        sku: data.sku,
        categoryId: data.categoryId,
        affiliateEnabled: data.affiliateEnabled,
        affiliateCommission: data.affiliateCommission,
        marketplaceVisible: data.marketplaceVisible,
      },
      include: { media: true, variants: true },
    });
  }

  async deleteProduct(id: string) {
    await this.prisma.product.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
    await this.audit.log('product.delete', 'Product', id);
    return { ok: true };
  }

  async publicStore(slug: string) {
    const store = await this.prisma.store.findUnique({
      where: { slug },
      include: {
        categories: true,
        domains: true,
        products: {
          where: { status: 'PUBLISHED' },
          include: { media: true },
          take: 40,
        },
      },
    });
    if (!store || store.status !== 'ACTIVE') throw new NotFoundException('Loja não encontrada');
    return store;
  }

  async publicProduct(storeSlug: string, productSlug: string) {
    const store = await this.prisma.store.findUnique({ where: { slug: storeSlug } });
    if (!store) throw new NotFoundException();
    const product = await this.prisma.product.findFirst({
      where: { storeId: store.id, slug: productSlug, status: 'PUBLISHED' },
      include: {
        media: true,
        variants: true,
        reviews: { where: { moderated: true }, take: 20, orderBy: { createdAt: 'desc' } },
        category: true,
        checkouts: { where: { active: true } },
      },
    });
    if (!product) throw new NotFoundException();
    await this.prisma.trackingEvent.create({
      data: { storeId: store.id, name: 'PRODUCT_VIEW', payload: { productId: product.id } },
    });
    return product;
  }

  async getOrCreateCart(storeId: string, sessionId: string, customerId?: string) {
    let cart = await this.prisma.cart.findFirst({
      where: { storeId, sessionId, convertedAt: null },
      include: { items: { include: { product: { include: { media: true } }, variant: true } } },
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { storeId, sessionId, customerId },
        include: { items: { include: { product: { include: { media: true } }, variant: true } } },
      });
    }
    return cart;
  }

  async addToCart(input: { storeId: string; sessionId: string; productId: string; variantId?: string; quantity?: number }) {
    const product = await this.prisma.product.findFirst({ where: { id: input.productId, status: 'PUBLISHED' } });
    if (!product) throw new NotFoundException('Produto indisponível');
    const cart = await this.getOrCreateCart(input.storeId, input.sessionId);
    const qty = input.quantity || 1;
    const existing = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: input.productId, variantId: input.variantId ?? null },
    });
    if (existing) {
      await this.prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: { increment: qty } } });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: input.productId,
          variantId: input.variantId,
          quantity: qty,
          price: product.price,
        },
      });
    }
    await this.prisma.trackingEvent.create({
      data: { storeId: input.storeId, name: 'ADD_TO_CART', payload: { productId: input.productId } },
    });
    return this.getOrCreateCart(input.storeId, input.sessionId);
  }

  async updateCartItem(itemId: string, quantity: number) {
    if (quantity <= 0) {
      await this.prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
    }
    return { ok: true };
  }

  async applyCoupon(storeId: string, sessionId: string, code: string) {
    const coupon = await this.prisma.coupon.findFirst({
      where: { storeId, code: code.toUpperCase(), active: true },
    });
    if (!coupon) throw new BadRequestException('Cupão inválido');
    if (coupon.endsAt && coupon.endsAt < new Date()) throw new BadRequestException('Cupão expirado');
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new BadRequestException('Cupão esgotado');
    const cart = await this.getOrCreateCart(storeId, sessionId);
    await this.prisma.cart.update({ where: { id: cart.id }, data: { couponCode: coupon.code } });
    return this.quoteCart(storeId, sessionId);
  }

  async quoteCart(storeId: string, sessionId: string, shippingMethodId?: string) {
    const cart = await this.getOrCreateCart(storeId, sessionId);
    const subtotal = cart.items.reduce((s, i) => s + money(i.price) * i.quantity, 0);
    let discount = 0;
    if (cart.couponCode) {
      const coupon = await this.prisma.coupon.findFirst({ where: { storeId, code: cart.couponCode } });
      if (coupon) {
        discount = coupon.type === 'PERCENT' ? subtotal * (money(coupon.value) / 100) : money(coupon.value);
        if (coupon.type === 'FREE_SHIPPING') discount = 0;
      }
    }
    let shipping = 0;
    if (shippingMethodId) {
      const method = await this.prisma.shippingMethod.findUnique({ where: { id: shippingMethodId } });
      if (method) shipping = money(method.price);
      if (cart.couponCode) {
        const coupon = await this.prisma.coupon.findFirst({ where: { storeId, code: cart.couponCode } });
        if (coupon?.type === 'FREE_SHIPPING') shipping = 0;
      }
    }
    const tax = cart.items.reduce((s, i) => {
      const t = Number((i.product as any)?.taxRate || 0);
      return s + money(i.price) * i.quantity * (t / 100);
    }, 0);
    const total = Math.max(0, subtotal - discount + shipping + tax);
    return { cart, subtotal, discount, shipping, tax, total, currency: 'AOA' };
  }

  async checkout(input: {
    storeId: string;
    sessionId: string;
    email: string;
    name: string;
    phone?: string;
    method: ChargeInput['method'];
    token?: string;
    shippingMethodId?: string;
    address?: any;
    bumpIds?: string[];
    checkoutId?: string;
    affiliateCode?: string;
    utm?: any;
    device?: string;
  }) {
    const quote = await this.quoteCart(input.storeId, input.sessionId, input.shippingMethodId);
    if (!quote.cart.items.length) throw new BadRequestException('Carrinho vazio');
    const store = await this.prisma.store.findUnique({ where: { id: input.storeId } });
    if (!store) throw new NotFoundException();

    const customer = await this.prisma.customer.upsert({
      where: { storeId_email: { storeId: input.storeId, email: input.email.toLowerCase() } },
      update: { name: input.name, phone: input.phone },
      create: {
        tenantId: store.tenantId,
        storeId: store.id,
        email: input.email.toLowerCase(),
        name: input.name,
        phone: input.phone,
        source: 'checkout',
      },
    });

    let extra = 0;
    const bumpItems: Array<{ productId: string; name: string; price: number; kind: any }> = [];
    if (input.bumpIds?.length) {
      const bumps = await this.prisma.orderBump.findMany({ where: { id: { in: input.bumpIds } }, include: { offer: true } });
      for (const b of bumps) {
        extra += money(b.price);
        bumpItems.push({ productId: b.offerId, name: b.offer.name, price: money(b.price), kind: b.offer.kind });
      }
    }

    const total = quote.total + extra;
    const kinds = quote.cart.items.map((i) => i.product.kind);
    const fulfillment =
      kinds.includes('PHYSICAL') && kinds.includes('DIGITAL')
        ? 'MIXED'
        : kinds.includes('PHYSICAL')
          ? 'PHYSICAL'
          : quote.cart.items.some((i) => i.product.type === 'SUBSCRIPTION')
            ? 'SUBSCRIPTION'
            : 'DIGITAL';

    const count = await this.prisma.order.count();
    const affiliate = input.affiliateCode
      ? await this.prisma.affiliate.findUnique({ where: { code: input.affiliateCode } })
      : quote.cart.affiliateCode
        ? await this.prisma.affiliate.findUnique({ where: { code: quote.cart.affiliateCode } })
        : null;

    const order = await this.prisma.order.create({
      data: {
        number: `TR-${String(count + 1001).padStart(6, '0')}`,
        tenantId: store.tenantId,
        storeId: store.id,
        customerId: customer.id,
        checkoutId: input.checkoutId,
        status: 'AWAITING_PAYMENT',
        fulfillmentType: fulfillment as any,
        subtotal: quote.subtotal + extra,
        discount: quote.discount,
        shipping: quote.shipping,
        tax: quote.tax,
        total,
        couponCode: quote.cart.couponCode,
        affiliateId: affiliate?.id,
        utm: input.utm || {},
        device: input.device,
        country: 'AO',
        items: {
          create: [
            ...quote.cart.items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId,
              name: i.product.name,
              quantity: i.quantity,
              unitPrice: i.price,
              total: money(i.price) * i.quantity,
              kind: i.product.kind,
            })),
            ...bumpItems.map((b) => ({
              productId: b.productId,
              name: b.name,
              quantity: 1,
              unitPrice: b.price,
              total: b.price,
              kind: b.kind,
              isBump: true,
            })),
          ],
        },
      },
      include: { items: true },
    });

    const charge = await this.gateway.charge({
      amount: total,
      currency: 'AOA',
      method: input.method,
      token: input.token,
    });

    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        provider: charge.provider,
        method: input.method,
        status: charge.status === 'APPROVED' ? 'APPROVED' : charge.status === 'FAILED' ? 'FAILED' : 'PENDING',
        amount: total,
        providerRef: charge.providerRef,
        referenceCode: charge.referenceCode,
        last4: charge.last4,
        brand: charge.brand,
        failureReason: charge.failureReason,
        paidAt: charge.status === 'APPROVED' ? new Date() : null,
      },
    });

    await this.prisma.trackingEvent.create({
      data: { storeId: store.id, name: 'INITIATE_CHECKOUT', payload: { orderId: order.id } },
    });

    if (charge.status === 'APPROVED') {
      await this.fulfillOrder(order.id);
    }

    await this.prisma.cart.update({
      where: { id: quote.cart.id },
      data: { convertedAt: charge.status === 'APPROVED' ? new Date() : null },
    });

    await this.enqueueWebhook(store.tenantId, charge.status === 'APPROVED' ? 'payment.approved' : 'payment.created', {
      orderId: order.id,
      paymentId: payment.id,
    });

    const upsells = input.checkoutId
      ? await this.prisma.upsell.findMany({ where: { checkoutId: input.checkoutId, active: true }, include: { offer: { include: { media: true } } }, orderBy: { position: 'asc' } })
      : [];

    const fresh = await this.prisma.order.findUnique({ where: { id: order.id }, include: { items: true, payments: true } });
    return { order: fresh, payment, upsells, next: charge.status === 'APPROVED' ? 'upsell' : 'pending' };
  }

  async confirmPayment(providerRef: string) {
    const payment = await this.prisma.payment.findFirst({ where: { providerRef } });
    if (!payment) throw new NotFoundException();
    const result = await this.gateway.confirm(providerRef);
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'APPROVED', paidAt: new Date() },
    });
    await this.fulfillOrder(payment.orderId);
    return { ok: true, result };
  }

  async acceptUpsell(orderId: string, upsellId: string, method: ChargeInput['method'], token?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new NotFoundException();
    const upsell = await this.prisma.upsell.findUnique({ where: { id: upsellId }, include: { offer: true } });
    if (!upsell) throw new NotFoundException();
    const charge = await this.gateway.charge({ amount: money(upsell.price), currency: 'AOA', method, token });
    if (charge.status !== 'APPROVED') throw new BadRequestException('Pagamento do upsell falhou');
    await this.prisma.orderItem.create({
      data: {
        orderId,
        productId: upsell.offerId,
        name: upsell.offer.name,
        quantity: 1,
        unitPrice: upsell.price,
        total: upsell.price,
        kind: upsell.offer.kind,
        isUpsell: true,
      },
    });
    await this.prisma.order.update({
      where: { id: orderId },
      data: { total: money(order.total) + money(upsell.price), subtotal: money(order.subtotal) + money(upsell.price) },
    });
    await this.prisma.payment.create({
      data: {
        orderId,
        provider: charge.provider,
        method,
        status: 'APPROVED',
        amount: upsell.price,
        providerRef: charge.providerRef,
        last4: charge.last4,
        paidAt: new Date(),
      },
    });
    await this.grantDigital(order.tenantId, order.customerId, upsell.offerId);
    return { ok: true };
  }

  async listOrders(q: { status?: string }) {
    return this.prisma.order.findMany({
      where: { tenantId: this.tenant(), status: q.status as any },
      include: { customer: true, items: true, payments: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getOrder(id: string) {
    return this.prisma.order.findFirst({
      where: { id, tenantId: this.tenant() },
      include: { customer: true, items: { include: { product: true } }, payments: true, refunds: true },
    });
  }

  async updateOrderStatus(id: string, status: any, tracking?: { trackingCode?: string; carrier?: string }) {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status,
        trackingCode: tracking?.trackingCode,
        carrier: tracking?.carrier,
        shippedAt: status === 'SHIPPED' ? new Date() : undefined,
        deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
        cancelledAt: status === 'CANCELLED' ? new Date() : undefined,
      },
    });
    if (status === 'SHIPPED') await this.enqueueWebhook(order.tenantId, 'order.shipped', { orderId: id });
    if (status === 'DELIVERED') await this.enqueueWebhook(order.tenantId, 'order.delivered', { orderId: id });
    await this.audit.log('order.status', 'Order', id, { status });
    return order;
  }

  async refund(orderId: string, amount: number, reason?: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId: this.tenant() },
      include: { payments: true },
    });
    if (!order) throw new NotFoundException();
    const payment = order.payments.find((p) => p.status === 'APPROVED');
    if (payment?.providerRef) await this.gateway.refund(payment.providerRef, amount);
    await this.prisma.refund.create({ data: { orderId, paymentId: payment?.id, amount, reason } });
    await this.prisma.payment.update({
      where: { id: payment!.id },
      data: { status: amount >= money(order.total) ? 'REFUNDED' : 'PARTIALLY_REFUNDED' },
    });
    await this.prisma.walletTx.create({
      data: {
        tenantId: order.tenantId,
        orderId,
        type: 'REFUND',
        direction: 'DEBIT',
        amount,
        balanceAfter: 0,
        description: `Reembolso ${order.number}`,
        available: true,
      },
    });
    await this.prisma.tenant.update({
      where: { id: order.tenantId },
      data: { walletAvailable: { decrement: amount } },
    });
    await this.audit.log('order.refund', 'Order', orderId, { amount, reason });
    await this.enqueueWebhook(order.tenantId, 'payment.refunded', { orderId, amount });
    return { ok: true };
  }

  async listCustomers(q?: string) {
    return this.prisma.customer.findMany({
      where: {
        tenantId: this.tenant(),
        OR: q ? [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] : undefined,
      },
      orderBy: { totalSpent: 'desc' },
      take: 100,
    });
  }

  async listCoupons() {
    return this.prisma.coupon.findMany({ where: { tenantId: this.tenant() }, orderBy: { createdAt: 'desc' } });
  }

  async createCoupon(data: any) {
    const store = await this.prisma.store.findFirst({ where: { tenantId: this.tenant() } });
    return this.prisma.coupon.create({
      data: {
        tenantId: this.tenant(),
        storeId: store!.id,
        code: String(data.code).toUpperCase(),
        type: data.type,
        value: data.value,
        usageLimit: data.usageLimit,
        endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
        firstPurchase: data.firstPurchase,
      },
    });
  }

  async listCheckouts() {
    return this.prisma.checkout.findMany({
      where: { tenantId: this.tenant() },
      include: { bumps: true, upsells: true, downsells: true, product: true },
    });
  }

  async saveCheckout(id: string | undefined, data: any) {
    const tenantId = this.tenant();
    const store = await this.prisma.store.findFirst({ where: { tenantId } });
    if (id) {
      return this.prisma.checkout.update({
        where: { id },
        data: { name: data.name, headline: data.headline, blocks: data.blocks, theme: data.theme, active: data.active },
      });
    }
    return this.prisma.checkout.create({
      data: {
        tenantId,
        storeId: store!.id,
        productId: data.productId,
        name: data.name,
        slug: data.slug || slugify(data.name),
        headline: data.headline,
        blocks: data.blocks || [],
        theme: data.theme || {},
      },
    });
  }

  async publicCheckout(storeSlug: string, checkoutSlug: string) {
    const store = await this.prisma.store.findUnique({ where: { slug: storeSlug } });
    if (!store) throw new NotFoundException();
    return this.prisma.checkout.findFirst({
      where: { storeId: store.id, slug: checkoutSlug, active: true },
      include: {
        product: { include: { media: true } },
        bumps: { where: { active: true }, include: { offer: { include: { media: true } } } },
        upsells: { where: { active: true }, include: { offer: true } },
      },
    });
  }

  private async fulfillOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } }, customer: true },
    });
    if (!order) return;
    const nextStatus = order.fulfillmentType === 'PHYSICAL' || order.fulfillmentType === 'MIXED' ? 'PROCESSING' : 'PAID';
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: nextStatus, paidAt: new Date() },
    });

    const feeRow = await this.prisma.platformFee.findFirst({
      where: { plan: (await this.prisma.tenant.findUnique({ where: { id: order.tenantId } }))!.plan },
    });
    const percent = feeRow ? money(feeRow.percent) : 3.9;
    const fee = Math.round(money(order.total) * (percent / 100));
    const net = money(order.total) - fee;
    const tenant = await this.prisma.tenant.findUnique({ where: { id: order.tenantId } });
    const pending = money(tenant!.walletPending) + net;
    await this.prisma.tenant.update({
      where: { id: order.tenantId },
      data: { walletPending: pending },
    });
    await this.prisma.walletTx.create({
      data: {
        tenantId: order.tenantId,
        orderId,
        type: 'SALE',
        direction: 'CREDIT',
        amount: net,
        balanceAfter: pending,
        description: `Venda ${order.number} (líquido após ${percent}% taxa)`,
        available: false,
        availableAt: addDays(new Date(), 2),
      },
    });
    await this.prisma.walletTx.create({
      data: {
        tenantId: order.tenantId,
        orderId,
        type: 'FEE',
        direction: 'DEBIT',
        amount: fee,
        balanceAfter: pending,
        description: `Taxa plataforma ${percent}%`,
        available: true,
      },
    });

    if (order.affiliateId) {
      for (const item of order.items) {
        if (item.product.affiliateEnabled) {
          const comm = Math.round(money(item.total) * (money(item.product.affiliateCommission) / 100));
          await this.prisma.commission.create({
            data: { affiliateId: order.affiliateId, orderId: order.id, amount: comm, status: 'pending' },
          });
          await this.prisma.affiliateSale.create({
            data: { affiliateId: order.affiliateId, orderId: order.id, amount: item.total, commission: comm },
          });
        }
      }
      await this.enqueueWebhook(order.tenantId, 'affiliate.sale', { orderId });
    }

    for (const item of order.items) {
      if (item.product.kind === 'DIGITAL') {
        await this.grantDigital(order.tenantId, order.customerId, item.productId);
      }
      if (item.product.kind === 'PHYSICAL' && item.product.trackInventory) {
        const inv = await this.prisma.inventory.findFirst({ where: { productId: item.productId } });
        if (inv) {
          await this.prisma.inventory.update({
            where: { id: inv.id },
            data: { quantity: { decrement: item.quantity } },
          });
          await this.prisma.inventoryMovement.create({
            data: { inventoryId: inv.id, type: 'OUT', quantity: item.quantity, reason: `Pedido ${order.number}` },
          });
        }
      }
      if (item.product.type === 'SUBSCRIPTION') {
        const plan = await this.prisma.subscriptionPlan.findFirst({ where: { productId: item.productId } });
        if (plan) {
          const start = new Date();
          const end = addDays(start, plan.interval === 'year' ? 365 : plan.interval === 'quarter' ? 90 : 30);
          await this.prisma.subscription.create({
            data: {
              tenantId: order.tenantId,
              customerId: order.customerId,
              planId: plan.id,
              orderId: order.id,
              status: 'ACTIVE',
              currentPeriodStart: start,
              currentPeriodEnd: end,
            },
          });
        }
      }
      await this.prisma.product.update({ where: { id: item.productId }, data: { salesCount: { increment: item.quantity } } });
    }

    await this.prisma.customer.update({
      where: { id: order.customerId },
      data: {
        totalSpent: { increment: order.total },
        ordersCount: { increment: 1 },
        lastOrderAt: new Date(),
      },
    });

    await this.prisma.trackingEvent.create({
      data: { storeId: order.storeId, name: 'PURCHASE', payload: { orderId, total: order.total } },
    });
    await this.enqueueWebhook(order.tenantId, 'order.created', { orderId });
    await this.prisma.emailJob.create({
      data: {
        to: order.customer.email,
        template: 'payment_approved',
        payload: { orderNumber: order.number, total: order.total },
        sentAt: new Date(),
      },
    });
  }

  private async grantDigital(tenantId: string, customerId: string, productId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    const product = await this.prisma.product.findUnique({ where: { id: productId }, include: { course: true } });
    if (!customer || !product) return;
    let userId = customer.userId;
    if (!userId) {
      const existing = await this.prisma.user.findUnique({ where: { email: customer.email } });
      if (existing) userId = existing.id;
      else {
        const created = await this.prisma.user.create({
          data: {
            email: customer.email,
            name: customer.name,
            passwordHash: await (await import('argon2')).hash('Temp@123456', { type: 2 }),
          },
        });
        userId = created.id;
      }
      await this.prisma.customer.update({ where: { id: customerId }, data: { userId } });
    }
    if (product.course) {
      await this.prisma.enrollment.upsert({
        where: { courseId_userId: { courseId: product.course.id, userId } },
        update: {},
        create: { courseId: product.course.id, userId },
      });
    }
  }

  private async enqueueWebhook(tenantId: string, event: string, payload: any) {
    const hooks = await this.prisma.webhook.findMany({ where: { tenantId, active: true, events: { has: event } } });
    for (const h of hooks) {
      await this.prisma.webhookDelivery.create({
        data: { webhookId: h.id, event, payload, attempts: 1, success: false, lastError: 'queued' },
      });
    }
  }
}
