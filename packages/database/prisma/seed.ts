import { PrismaClient, PlanKey, ProductKind, ProductType, ProductStatus, OrderStatus, PaymentStatus, PaymentMethodType, FulfillmentType, TeamRole, AffiliateStatus, SubscriptionStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();
const hash = (p: string) => argon2.hash(p, { type: argon2.argon2id });

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log('Seeding Trauner…');

  await prisma.platformFee.createMany({
    data: [
      { plan: PlanKey.FREE, percent: 8, fixed: 0, payoutFee: 500 },
      { plan: PlanKey.STARTER, percent: 5.5, fixed: 0, payoutFee: 400 },
      { plan: PlanKey.PRO, percent: 3.9, fixed: 0, payoutFee: 250 },
      { plan: PlanKey.BUSINESS, percent: 2.5, fixed: 0, payoutFee: 150 },
      { plan: PlanKey.ENTERPRISE, percent: 1.5, fixed: 0, payoutFee: 0 },
    ],
  });

  await prisma.platformPlan.createMany({
    data: [
      { key: PlanKey.FREE, name: 'Free', price: 0, limits: { products: 5, monthlySales: 20 } },
      { key: PlanKey.STARTER, name: 'Starter', price: 9900, limits: { products: 25, monthlySales: 200 } },
      { key: PlanKey.PRO, name: 'Pro', price: 24900, limits: { products: 100, monthlySales: 2000 } },
      { key: PlanKey.BUSINESS, name: 'Business', price: 59900, limits: { products: 500, monthlySales: 20000 } },
      { key: PlanKey.ENTERPRISE, name: 'Enterprise', price: 0, limits: { products: -1, monthlySales: -1 } },
    ],
  });

  await prisma.platformBanner.create({
    data: {
      title: 'Black Friday Trauner',
      body: 'Taxas reduzidas para vendedores Pro até 30 de Novembro.',
      href: '/pricing',
      active: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: process.env.SEED_ADMIN_EMAIL || 'emma.t@example.net',
      passwordHash: await hash(process.env.SEED_ADMIN_PASSWORD || 'Admin@123!'),
      name: 'Super Admin',
      isSuperAdmin: true,
      emailVerifiedAt: new Date(),
    },
  });

  const sellers = await Promise.all(
    [
      ['Ana Silva', 'ana@atlasfit.ao', 'Atlas Fit'],
      ['Miguel dos Santos', 'miguel@nzaia.ao', 'Nzaia Books'],
      ['Carmen Neto', 'carmen@kwanzawear.ao', 'Kwanza Wear'],
      ['Paulo Teixeira', 'paulo@lundatech.ao', 'Lunda Tech'],
      ['Rosa Ferreira', 'rosa@semba.ao', 'Semba Kitchen'],
    ].map(async ([name, email]) =>
      prisma.user.create({
        data: {
          email,
          name,
          passwordHash: await hash('Seller@123!'),
          emailVerifiedAt: new Date(),
          phone: '+244923000000',
        },
      }),
    ),
  );

  const storeDefs = [
    {
      slug: 'atlas-fit',
      name: 'Atlas Fit',
      tagline: 'Treino, suplementos e estilo de vida.',
      template: 'atelier',
      categoryNames: ['Cursos', 'Suplementos', 'Roupa', 'Acessórios'],
      theme: { primary: '#0F3D2E', accent: '#C4A574', font: 'Outfit' },
      plan: PlanKey.PRO,
    },
    {
      slug: 'nzaia-books',
      name: 'Nzaia Books',
      tagline: 'Ebooks e mentorias para empreender em Angola.',
      template: 'editorial',
      categoryNames: ['Negócios', 'Ebooks', 'Mentorias'],
      theme: { primary: '#1B1B1B', accent: '#D4A853', font: 'Newsreader' },
      plan: PlanKey.STARTER,
    },
    {
      slug: 'kwanza-wear',
      name: 'Kwanza Wear',
      tagline: 'Moda urbana feita em Luanda.',
      template: 'boutique',
      categoryNames: ['Homem', 'Mulher', 'Acessórios'],
      theme: { primary: '#111111', accent: '#E8D5B5', font: 'Syne' },
      plan: PlanKey.BUSINESS,
    },
    {
      slug: 'lunda-tech',
      name: 'Lunda Tech',
      tagline: 'Software, templates e gadgets.',
      template: 'studio',
      categoryNames: ['Software', 'Electrónicos', 'Templates'],
      theme: { primary: '#0B1F33', accent: '#5B8DEF', font: 'Geist' },
      plan: PlanKey.PRO,
    },
    {
      slug: 'semba-kitchen',
      name: 'Semba Kitchen',
      tagline: 'Culinária angolana, cursos e produtos da terra.',
      template: 'harvest',
      categoryNames: ['Cursos', 'Alimentos', 'Utensílios'],
      theme: { primary: '#5C2E15', accent: '#E0A458', font: 'Fraunces' },
      plan: PlanKey.STARTER,
    },
  ];

  const stores: Array<{
    tenantId: string;
    storeId: string;
    slug: string;
    categories: Record<string, string>;
    warehouseId: string;
  }> = [];

  for (let i = 0; i < storeDefs.length; i++) {
    const def = storeDefs[i];
    const owner = sellers[i];
    const tenant = await prisma.tenant.create({
      data: {
        name: def.name,
        slug: def.slug,
        ownerId: owner.id,
        plan: def.plan,
        status: 'ACTIVE',
        walletAvailable: 850000 + i * 120000,
        walletPending: 95000,
        members: {
          create: {
            userId: owner.id,
            role: TeamRole.OWNER,
            permissions: ['*'],
            acceptedAt: new Date(),
          },
        },
      },
    });
    const store = await prisma.store.create({
      data: {
        tenantId: tenant.id,
        name: def.name,
        slug: def.slug,
        tagline: def.tagline,
        description: def.tagline,
        status: 'ACTIVE',
        template: def.template,
        theme: def.theme,
        pages: defaultPages(def.name, def.tagline),
        seoTitle: `${def.name} · Loja oficial`,
        seoDescription: def.tagline,
        publishedAt: new Date(),
        contactEmail: owner.email,
      },
    });
    await prisma.domain.create({
      data: {
        tenantId: tenant.id,
        storeId: store.id,
        host: `${def.slug}.localhost`,
        isPrimary: true,
        isSubdomain: true,
        status: 'ACTIVE',
        txtToken: `trauner-verify-${def.slug}`,
        verifiedAt: new Date(),
      },
    });
    const warehouse = await prisma.warehouse.create({
      data: { tenantId: tenant.id, storeId: store.id, name: 'Depósito principal', city: 'Luanda', isDefault: true },
    });
    await prisma.shippingMethod.createMany({
      data: [
        { storeId: store.id, name: 'Levantamento na loja', type: 'pickup', price: 0, isPickup: true, estimatedDays: 0 },
        { storeId: store.id, name: 'Luanda — motoboy', type: 'region', price: 2500, region: 'Luanda', estimatedDays: 1 },
        { storeId: store.id, name: 'Nacional', type: 'weight', price: 6500, estimatedDays: 5 },
        { storeId: store.id, name: 'Frete grátis > 50.000 Kz', type: 'free', price: 0, estimatedDays: 5 },
      ],
    });
    const categories: Record<string, string> = {};
    for (const name of def.categoryNames) {
      const c = await prisma.productCategory.create({
        data: { storeId: store.id, name, slug: slugify(name) },
      });
      categories[name] = c.id;
    }
    stores.push({ tenantId: tenant.id, storeId: store.id, slug: def.slug, categories, warehouseId: warehouse.id });
  }

  const productsSpec = buildProducts();
  const createdProducts: Array<{ id: string; storeKey: string; type: ProductType; price: number; name: string; slug: string }> = [];

  for (const p of productsSpec) {
    const store = stores.find((s) => s.slug === p.store)!;
    const product = await prisma.product.create({
      data: {
        tenantId: store.tenantId,
        storeId: store.storeId,
        categoryId: store.categories[p.category],
        name: p.name,
        slug: p.slug,
        shortDescription: p.short,
        description: p.description,
        kind: p.kind,
        type: p.type,
        status: ProductStatus.PUBLISHED,
        price: p.price,
        compareAtPrice: p.compare,
        sku: p.sku,
        trackInventory: p.kind === ProductKind.PHYSICAL,
        tags: p.tags,
        marketplaceVisible: true,
        affiliateEnabled: p.affiliate,
        affiliateCommission: p.affiliate ? 20 : 0,
        averageRating: p.rating,
        reviewCount: 3,
        salesCount: p.sales,
        publishedAt: daysAgo(20),
        media: { create: [{ url: p.image, type: 'image', alt: p.name, position: 0 }] },
        warranty: p.kind === ProductKind.PHYSICAL ? '30 dias' : '7 dias de garantia de acesso',
        returnPolicy: 'Devolução em 14 dias para produtos físicos não usados.',
      },
    });
    if (p.kind === ProductKind.PHYSICAL) {
      const variant = await prisma.productVariant.create({
        data: { productId: product.id, name: 'Padrão', sku: p.sku, price: p.price },
      });
      const inv = await prisma.inventory.create({
        data: { productId: product.id, variantId: variant.id, warehouseId: store.warehouseId, quantity: 80, minQuantity: 8 },
      });
      await prisma.inventoryMovement.create({
        data: { inventoryId: inv.id, type: 'IN', quantity: 80, reason: 'Stock inicial' },
      });
    }
    createdProducts.push({ id: product.id, storeKey: p.store, type: p.type, price: p.price, name: p.name, slug: p.slug });
  }

  const courseProducts = createdProducts.filter((p) => p.type === ProductType.COURSE).slice(0, 3);
  let lessonCount = 0;
  for (const cp of courseProducts) {
    const course = await prisma.course.create({
      data: {
        productId: cp.id,
        objectives: ['Dominar o essencial', 'Aplicar na prática', 'Obter certificado'],
        level: 'Iniciante',
        durationMin: 240,
      },
    });
    for (let m = 1; m <= 4; m++) {
      const mod = await prisma.courseModule.create({
        data: { courseId: course.id, title: `Módulo ${m}`, position: m, locked: m > 1 },
      });
      const lessonsInMod = m === 4 ? 2 : 6;
      for (let l = 1; l <= lessonsInMod && lessonCount < 20; l++) {
        lessonCount++;
        await prisma.lesson.create({
          data: {
            moduleId: mod.id,
            title: `Aula ${m}.${l}`,
            type: l % 3 === 0 ? 'pdf' : 'video',
            videoUrl: 'https://cdn.trauner.local/demo/lesson.mp4',
            content: 'Conteúdo da aula em texto e recursos.',
            durationSec: 720,
            position: l,
            chapters: [{ t: 0, title: 'Introdução' }, { t: 180, title: 'Prática' }],
          },
        });
      }
    }
    const quiz = await prisma.quiz.create({
      data: { courseId: course.id, title: 'Avaliação final', passScore: 70, maxAttempts: 3 },
    });
    await prisma.quizQuestion.createMany({
      data: [
        { quizId: quiz.id, type: 'multiple', prompt: 'Qual é o primeiro passo?', options: ['Planear', 'Desistir', 'Ignorar'], answer: 'Planear', points: 1, position: 1 },
        { quizId: quiz.id, type: 'boolean', prompt: 'Praticar todos os dias ajuda.', options: ['true', 'false'], answer: 'true', points: 1, position: 2 },
      ],
    });
  }

  const customersUsers = [];
  for (let i = 1; i <= 10; i++) {
    customersUsers.push(
      await prisma.user.create({
        data: {
          email: `cliente${i}@mail.ao`,
          name: `Cliente ${i}`,
          passwordHash: await hash('Cliente@123!'),
          emailVerifiedAt: new Date(),
        },
      }),
    );
  }

  const customers = [];
  for (let i = 0; i < 10; i++) {
    const store = stores[i % stores.length];
    customers.push(
      await prisma.customer.create({
        data: {
          tenantId: store.tenantId,
          storeId: store.storeId,
          userId: customersUsers[i].id,
          email: customersUsers[i].email,
          name: customersUsers[i].name,
          phone: `+24492${1000000 + i}`,
          country: 'AO',
          city: i % 2 === 0 ? 'Luanda' : 'Benguela',
          tags: i < 3 ? ['vip'] : i > 7 ? ['inativo'] : ['novo'],
          source: i % 2 === 0 ? 'marketplace' : 'direct',
        },
      }),
    );
  }

  const affiliates = [];
  for (let i = 0; i < 5; i++) {
    const u = await prisma.user.create({
      data: {
        email: `afiliado${i + 1}@mail.ao`,
        name: `Afiliado ${i + 1}`,
        passwordHash: await hash('Afiliado@123!'),
        emailVerifiedAt: new Date(),
      },
    });
    affiliates.push(
      await prisma.affiliate.create({
        data: { userId: u.id, tenantId: stores[i].tenantId, code: `AFF${i + 1}00`, status: AffiliateStatus.APPROVED },
      }),
    );
  }

  for (const store of stores) {
    await prisma.coupon.create({
      data: {
        tenantId: store.tenantId,
        storeId: store.storeId,
        code: 'BEMVINDO10',
        type: 'PERCENT',
        value: 10,
        usageLimit: 1000,
        active: true,
      },
    });
    await prisma.checkout.create({
      data: {
        tenantId: store.tenantId,
        storeId: store.storeId,
        name: 'Checkout padrão',
        slug: 'padrao',
        headline: 'Finalize a sua compra com segurança',
        isDefault: true,
        blocks: [
          { type: 'logo' },
          { type: 'title' },
          { type: 'benefits' },
          { type: 'form' },
          { type: 'summary' },
          { type: 'payment' },
          { type: 'guarantee' },
          { type: 'faq' },
        ],
      },
    });
  }

  let orderSeq = 1001;
  for (let i = 0; i < 20; i++) {
    const product = createdProducts[i % createdProducts.length];
    const store = stores.find((s) => s.slug === product.storeKey)!;
    const customer = customers[i % customers.length];
    const day = i < 4 ? 0 : i < 10 ? 3 : 18 + (i % 10);
    const total = product.price;
    const fee = Math.round(Number(total) * 0.039);
    const net = Number(total) - fee;
    const status: OrderStatus = i === 19 ? OrderStatus.AWAITING_PAYMENT : i === 18 ? OrderStatus.SHIPPED : OrderStatus.PAID;
    const fulfillment = product.type === ProductType.PHYSICAL ? FulfillmentType.PHYSICAL : product.type === ProductType.SUBSCRIPTION ? FulfillmentType.SUBSCRIPTION : FulfillmentType.DIGITAL;
    const order = await prisma.order.create({
      data: {
        number: `TR-${orderSeq++}`,
        tenantId: store.tenantId,
        storeId: store.storeId,
        customerId: customer.id,
        status,
        fulfillmentType: fulfillment,
        subtotal: total,
        total,
        currency: 'AOA',
        affiliateId: i % 4 === 0 ? affiliates[i % 5].id : null,
        device: i % 3 === 0 ? 'mobile' : 'desktop',
        country: 'AO',
        paidAt: status === OrderStatus.AWAITING_PAYMENT ? null : daysAgo(day),
        shippedAt: status === OrderStatus.SHIPPED ? daysAgo(1) : null,
        createdAt: daysAgo(day),
        items: {
          create: {
            productId: product.id,
            name: product.name,
            quantity: 1,
            unitPrice: total,
            total,
            kind: product.type === ProductType.PHYSICAL ? ProductKind.PHYSICAL : ProductKind.DIGITAL,
          },
        },
        payments: {
          create: {
            provider: 'sandbox',
            method: i % 3 === 0 ? PaymentMethodType.REFERENCE : PaymentMethodType.CARD,
            status: status === OrderStatus.AWAITING_PAYMENT ? PaymentStatus.PENDING : PaymentStatus.APPROVED,
            amount: total,
            last4: '4242',
            brand: 'visa',
            paidAt: status === OrderStatus.AWAITING_PAYMENT ? null : daysAgo(day),
          },
        },
      },
    });
    if (status !== OrderStatus.AWAITING_PAYMENT) {
      await prisma.walletTx.create({
        data: {
          tenantId: store.tenantId,
          orderId: order.id,
          type: 'SALE',
          direction: 'CREDIT',
          amount: net,
          balanceAfter: net,
          description: `Venda ${order.number}`,
          available: day > 2,
          availableAt: daysAgo(Math.max(day - 2, 0)),
        },
      });
      if (i % 4 === 0) {
        const comm = Math.round(Number(total) * 0.2);
        await prisma.commission.create({
          data: { affiliateId: affiliates[i % 5].id, orderId: order.id, amount: comm, status: 'released', releasedAt: new Date() },
        });
        await prisma.affiliateSale.create({
          data: { affiliateId: affiliates[i % 5].id, orderId: order.id, amount: total, commission: comm },
        });
      }
    }
    await prisma.customer.update({
      where: { id: customer.id },
      data: { totalSpent: { increment: total }, ordersCount: { increment: 1 }, lastOrderAt: daysAgo(day) },
    });
    if (product.type === ProductType.COURSE) {
      const course = await prisma.course.findUnique({ where: { productId: product.id } });
      if (course) {
        await prisma.enrollment.create({
          data: { courseId: course.id, userId: customer.userId!, progress: 67 },
        });
      }
    }
  }

  for (const p of createdProducts.slice(0, 12)) {
    await prisma.review.create({
      data: {
        productId: p.id,
        storeId: stores.find((s) => s.slug === p.storeKey)!.storeId,
        userId: customersUsers[0].id,
        rating: 5,
        comment: 'Excelente qualidade. Recomendo.',
        verified: true,
        moderated: true,
      },
    });
  }

  const subProduct = createdProducts.find((p) => p.type === ProductType.SUBSCRIPTION);
  if (subProduct) {
    const plan = await prisma.subscriptionPlan.create({
      data: { productId: subProduct.id, name: 'Mensal', interval: 'month', intervalCount: 1, price: subProduct.price, trialDays: 7 },
    });
    const store = stores.find((s) => s.slug === subProduct.storeKey)!;
    await prisma.subscription.create({
      data: {
        tenantId: store.tenantId,
        customerId: customers[0].id,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: daysAgo(10),
        currentPeriodEnd: daysAgo(-20),
      },
    });
  }

  for (const cp of courseProducts.slice(0, 1)) {
    const enrollment = await prisma.enrollment.findFirst({ where: { course: { productId: cp.id } } });
    const course = await prisma.course.findUnique({ where: { productId: cp.id } });
    if (enrollment && course) {
      await prisma.certificate.create({
        data: {
          courseId: course.id,
          enrollmentId: enrollment.id,
          userId: enrollment.userId,
          code: 'TRN-CERT-DEMO-001',
        },
      });
    }
  }

  await prisma.webhook.create({
    data: {
      tenantId: stores[0].tenantId,
      url: 'https://example.com/webhooks/trauner',
      secret: 'whsec_demo',
      events: ['payment.approved', 'order.created'],
    },
  });

  console.log('Seed complete.');
  console.log('Admin: emma.t@example.net / Admin@123!');
  console.log('Seller: ana@atlasfit.ao / Seller@123!');
  console.log('Customer: cliente1@mail.ao / Cliente@123!');
  console.log('Affiliate: afiliado1@mail.ao / Afiliado@123!');
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function defaultPages(name: string, tagline: string) {
  return [
    {
      slug: 'home',
      blocks: [
        { type: 'hero', title: name, subtitle: tagline, cta: 'Ver produtos' },
        { type: 'benefits', items: ['Pagamento seguro', 'Entrega em Angola', 'Suporte humano'] },
        { type: 'products', source: 'featured' },
        { type: 'testimonials' },
        { type: 'faq' },
        { type: 'newsletter' },
      ],
    },
  ];
}

function buildProducts() {
  const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/800`;
  return [
    { store: 'atlas-fit', category: 'Cursos', name: 'Curso de Musculação em Casa', slug: 'curso-musculacao', short: 'Treino completo sem ginásio.', description: 'Programa de 12 semanas com vídeos, planilhas e acompanhamento.', kind: ProductKind.DIGITAL, type: ProductType.COURSE, price: 50000, compare: 75000, sku: 'AF-CRS-01', tags: ['fitness'], affiliate: true, rating: 4.8, sales: 42, image: img('fit1') },
    { store: 'atlas-fit', category: 'Cursos', name: 'Mentoria Fitness 1:1', slug: 'mentoria-fitness', short: 'Sessões privadas.', description: 'Consultoria personalizada de treino e nutrição.', kind: ProductKind.DIGITAL, type: ProductType.MENTORSHIP, price: 120000, compare: null, sku: 'AF-MEN-01', tags: ['mentoria'], affiliate: false, rating: 5, sales: 8, image: img('fit2') },
    { store: 'atlas-fit', category: 'Cursos', name: 'Ebook de Nutrição Desportiva', slug: 'ebook-nutricao', short: 'Guia prático.', description: 'PDF com planos alimentares angolanos.', kind: ProductKind.DIGITAL, type: ProductType.EBOOK, price: 8000, compare: 12000, sku: 'AF-EB-01', tags: ['ebook'], affiliate: true, rating: 4.6, sales: 90, image: img('fit3') },
    { store: 'atlas-fit', category: 'Suplementos', name: 'Proteína Whey 1kg', slug: 'whey-1kg', short: 'Sabor chocolate.', description: 'Suplemento proteico para recuperação.', kind: ProductKind.PHYSICAL, type: ProductType.PHYSICAL, price: 28000, compare: 32000, sku: 'AF-WH-01', tags: ['suplemento'], affiliate: true, rating: 4.4, sales: 60, image: img('fit4') },
    { store: 'atlas-fit', category: 'Roupa', name: 'T-shirt Atlas Performance', slug: 'tshirt-atlas', short: 'Dry-fit.', description: 'T-shirt técnica para treino.', kind: ProductKind.PHYSICAL, type: ProductType.PHYSICAL, price: 9500, compare: null, sku: 'AF-TS-01', tags: ['roupa'], affiliate: true, rating: 4.5, sales: 33, image: img('fit5') },
    { store: 'atlas-fit', category: 'Acessórios', name: 'Garrafa térmica 750ml', slug: 'garrafa-750', short: 'Inox.', description: 'Mantém a temperatura 12h.', kind: ProductKind.PHYSICAL, type: ProductType.PHYSICAL, price: 7500, compare: 9000, sku: 'AF-BT-01', tags: ['acessorio'], affiliate: false, rating: 4.2, sales: 21, image: img('fit6') },
    { store: 'nzaia-books', category: 'Ebooks', name: 'Como vender online em Angola', slug: 'vender-online-ao', short: 'Do zero à primeira venda.', description: 'Guia completo de e-commerce local.', kind: ProductKind.DIGITAL, type: ProductType.EBOOK, price: 12000, compare: 18000, sku: 'NZ-EB-01', tags: ['negocio'], affiliate: true, rating: 4.9, sales: 140, image: img('book1') },
    { store: 'nzaia-books', category: 'Ebooks', name: 'Finanças pessoais em Kwanza', slug: 'financas-kwanza', short: 'Controlo real.', description: 'Método para orçamento familiar.', kind: ProductKind.DIGITAL, type: ProductType.EBOOK, price: 7000, compare: null, sku: 'NZ-EB-02', tags: ['financas'], affiliate: true, rating: 4.7, sales: 77, image: img('book2') },
    { store: 'nzaia-books', category: 'Negócios', name: 'Curso Excel para negócios', slug: 'excel-negocios', short: 'Do básico ao dashboard.', description: '20 aulas práticas de Excel.', kind: ProductKind.DIGITAL, type: ProductType.COURSE, price: 35000, compare: 49000, sku: 'NZ-CRS-01', tags: ['excel'], affiliate: true, rating: 4.8, sales: 55, image: img('book3') },
    { store: 'nzaia-books', category: 'Mentorias', name: 'Consultoria de posicionamento', slug: 'consultoria-posicionamento', short: '90 minutos.', description: 'Sessão estratégica para a sua marca.', kind: ProductKind.DIGITAL, type: ProductType.SERVICE, price: 45000, compare: null, sku: 'NZ-SV-01', tags: ['servico'], affiliate: false, rating: 5, sales: 12, image: img('book4') },
    { store: 'nzaia-books', category: 'Negócios', name: 'Comunidade Empreende AO', slug: 'comunidade-empreende', short: 'Acesso anual.', description: 'Grupo privado, lives e templates.', kind: ProductKind.DIGITAL, type: ProductType.COMMUNITY, price: 24000, compare: null, sku: 'NZ-CM-01', tags: ['comunidade'], affiliate: true, rating: 4.6, sales: 30, image: img('book5') },
    { store: 'nzaia-books', category: 'Negócios', name: 'Assinatura Nzaia Pro', slug: 'nzaia-pro', short: 'Conteúdo novo todo mês.', description: 'Clube de ebooks e aulas mensais.', kind: ProductKind.DIGITAL, type: ProductType.SUBSCRIPTION, price: 6500, compare: null, sku: 'NZ-SUB-01', tags: ['assinatura'], affiliate: true, rating: 4.5, sales: 40, image: img('book6') },
    { store: 'kwanza-wear', category: 'Homem', name: 'Hoodie Luanda Night', slug: 'hoodie-luanda', short: 'Algodão pesado.', description: 'Hoodie oversized edição limitada.', kind: ProductKind.PHYSICAL, type: ProductType.PHYSICAL, price: 22000, compare: 26000, sku: 'KW-HD-01', tags: ['moda'], affiliate: true, rating: 4.7, sales: 48, image: img('wear1') },
    { store: 'kwanza-wear', category: 'Mulher', name: 'Vestido Semba', slug: 'vestido-semba', short: 'Linho.', description: 'Corte contemporâneo inspirado no semba.', kind: ProductKind.PHYSICAL, type: ProductType.PHYSICAL, price: 31000, compare: null, sku: 'KW-VD-01', tags: ['moda'], affiliate: true, rating: 4.8, sales: 19, image: img('wear2') },
    { store: 'kwanza-wear', category: 'Homem', name: 'Calças cargo Kizomba', slug: 'calcas-cargo', short: 'Utilitárias.', description: 'Cargo com bolsos técnicos.', kind: ProductKind.PHYSICAL, type: ProductType.PHYSICAL, price: 18500, compare: 21000, sku: 'KW-CG-01', tags: ['moda'], affiliate: false, rating: 4.3, sales: 27, image: img('wear3') },
    { store: 'kwanza-wear', category: 'Acessórios', name: 'Boné Traço', slug: 'bone-traco', short: 'Bordado.', description: 'Boné de algodão com logo bordado.', kind: ProductKind.PHYSICAL, type: ProductType.PHYSICAL, price: 6500, compare: null, sku: 'KW-BN-01', tags: ['acessorio'], affiliate: true, rating: 4.4, sales: 70, image: img('wear4') },
    { store: 'kwanza-wear', category: 'Mulher', name: 'Saco tote Baía', slug: 'saco-baia', short: 'Lona.', description: 'Tote bag diária.', kind: ProductKind.PHYSICAL, type: ProductType.PHYSICAL, price: 11000, compare: 14000, sku: 'KW-BG-01', tags: ['acessorio'], affiliate: true, rating: 4.6, sales: 36, image: img('wear5') },
    { store: 'kwanza-wear', category: 'Homem', name: 'Ténis Kwanza Runner', slug: 'tenis-runner', short: 'Edição cidade.', description: 'Sapatilha urbana confortável.', kind: ProductKind.PHYSICAL, type: ProductType.PHYSICAL, price: 42000, compare: 49000, sku: 'KW-TN-01', tags: ['calcado'], affiliate: false, rating: 4.5, sales: 15, image: img('wear6') },
    { store: 'lunda-tech', category: 'Software', name: 'Template Notion PME', slug: 'notion-pme', short: 'Sistema operacional.', description: 'Workspace completo para PME angolanas.', kind: ProductKind.DIGITAL, type: ProductType.SOFTWARE, price: 15000, compare: 22000, sku: 'LT-SW-01', tags: ['template'], affiliate: true, rating: 4.9, sales: 88, image: img('tech1') },
    { store: 'lunda-tech', category: 'Templates', name: 'Pack de apresentações', slug: 'pack-slides', short: '20 templates.', description: 'Slides para pitch e relatórios.', kind: ProductKind.DIGITAL, type: ProductType.FILE, price: 9000, compare: null, sku: 'LT-FL-01', tags: ['design'], affiliate: true, rating: 4.6, sales: 51, image: img('tech2') },
    { store: 'lunda-tech', category: 'Software', name: 'Curso de automação no-code', slug: 'curso-nocode', short: 'Zapier, Make e n8n.', description: 'Automatize operações sem programar.', kind: ProductKind.DIGITAL, type: ProductType.COURSE, price: 42000, compare: 59000, sku: 'LT-CRS-01', tags: ['curso'], affiliate: true, rating: 4.8, sales: 37, image: img('tech3') },
    { store: 'lunda-tech', category: 'Electrónicos', name: 'Auriculares ANC', slug: 'auriculares-anc', short: 'Cancelamento de ruído.', description: 'Bluetooth 5.3, 30h de bateria.', kind: ProductKind.PHYSICAL, type: ProductType.PHYSICAL, price: 38000, compare: 45000, sku: 'LT-EL-01', tags: ['gadget'], affiliate: false, rating: 4.4, sales: 22, image: img('tech4') },
    { store: 'lunda-tech', category: 'Electrónicos', name: 'Powerbank 20.000 mAh', slug: 'powerbank-20', short: 'Carga rápida.', description: 'USB-C PD 22.5W.', kind: ProductKind.PHYSICAL, type: ProductType.PHYSICAL, price: 16500, compare: null, sku: 'LT-EL-02', tags: ['gadget'], affiliate: true, rating: 4.3, sales: 41, image: img('tech5') },
    { store: 'lunda-tech', category: 'Templates', name: 'Kit de identidade visual', slug: 'kit-identidade', short: 'Logo + paleta.', description: 'Ficheiros editáveis para a sua marca.', kind: ProductKind.DIGITAL, type: ProductType.FILE, price: 27000, compare: 35000, sku: 'LT-FL-02', tags: ['branding'], affiliate: true, rating: 4.7, sales: 18, image: img('tech6') },
    { store: 'semba-kitchen', category: 'Cursos', name: 'Cozinha angolana contemporânea', slug: 'cozinha-ao', short: '12 receitas filmadas.', description: 'Do funge ao marisco, com técnica profissional.', kind: ProductKind.DIGITAL, type: ProductType.VIDEO, price: 29000, compare: 39000, sku: 'SK-VD-01', tags: ['culinaria'], affiliate: true, rating: 4.9, sales: 64, image: img('food1') },
    { store: 'semba-kitchen', category: 'Alimentos', name: 'Kit especiarias Semba', slug: 'kit-especiarias', short: '5 blends.', description: 'Misturas para calulu, mufete e grelhados.', kind: ProductKind.PHYSICAL, type: ProductType.PHYSICAL, price: 8500, compare: null, sku: 'SK-AL-01', tags: ['alimento'], affiliate: true, rating: 4.6, sales: 53, image: img('food2') },
    { store: 'semba-kitchen', category: 'Alimentos', name: 'Café da Huíla 500g', slug: 'cafe-huila', short: 'Torrado artesanal.', description: 'Grãos seleccionados da Huíla.', kind: ProductKind.PHYSICAL, type: ProductType.PHYSICAL, price: 7200, compare: 8500, sku: 'SK-AL-02', tags: ['cafe'], affiliate: false, rating: 4.8, sales: 47, image: img('food3') },
    { store: 'semba-kitchen', category: 'Utensílios', name: 'Tábua de pau-preto', slug: 'tabua-pau-preto', short: 'Artesanal.', description: 'Peça única feita por artesãos de Luanda.', kind: ProductKind.PHYSICAL, type: ProductType.PHYSICAL, price: 14000, compare: null, sku: 'SK-UT-01', tags: ['artesanal'], affiliate: true, rating: 4.7, sales: 16, image: img('food4') },
    { store: 'semba-kitchen', category: 'Cursos', name: 'Ebook 40 petiscos angolanos', slug: 'ebook-petiscos', short: 'PDF ilustrado.', description: 'Receitas para eventos e família.', kind: ProductKind.DIGITAL, type: ProductType.EBOOK, price: 5500, compare: 8000, sku: 'SK-EB-01', tags: ['ebook'], affiliate: true, rating: 4.5, sales: 73, image: img('food5') },
    { store: 'semba-kitchen', category: 'Utensílios', name: 'Avental Semba Chef', slug: 'avental-chef', short: 'Lona pesada.', description: 'Avental profissional com bolsos.', kind: ProductKind.PHYSICAL, type: ProductType.PHYSICAL, price: 9800, compare: 12000, sku: 'SK-UT-02', tags: ['utensilio'], affiliate: false, rating: 4.4, sales: 25, image: img('food6') },
  ];
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
