import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { requireTenantId } from '../../common/als';
import { slugify } from '../../common/util';

@Injectable()
export class AiService {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(AnalyticsService) private analytics: AnalyticsService,
  ) {}

  async copilot(prompt: string) {
    const insights = await this.analytics.insights();
    const lower = prompt.toLowerCase();
    if (lower.includes('preço') || lower.includes('pricing')) {
      return { type: 'pricing', ...await this.pricing(), insights: insights.notes };
    }
    if (lower.includes('checkout')) return { type: 'checkout', ...(await this.optimizeCheckout()), insights: insights.notes };
    if (lower.includes('loja') || lower.includes('store')) return { type: 'store', ...(await this.buildStore(prompt)) };
    if (lower.includes('curso') || lower.includes('produto')) return { type: 'product', ...(await this.buildProduct(prompt)) };
    return {
      type: 'insights',
      answer: insights.notes.join('\n'),
      suggestions: [
        'Criar um order bump no checkout mais visitado',
        'Reactivar clientes inactivos com cupão BEMVINDO10',
        'Destacar o produto de maior conversão na homepage',
      ],
      kpis: insights.kpis,
    };
  }

  async buildStore(brief: string) {
    const name = this.extractName(brief) || 'Minha Loja';
    const palette = brief.toLowerCase().includes('premium') || brief.toLowerCase().includes('luxo')
      ? { primary: '#111111', accent: '#C4A574', bg: '#F7F3EC' }
      : { primary: '#0F3D2E', accent: '#E0A458', bg: '#F4F1EA' };
    const categories = this.guessCategories(brief);
    const products = categories.slice(0, 4).map((c, i) => ({
      name: `${c} em destaque`,
      description: `Peça seleccionada para ${name}. ${brief}`,
      price: 15000 + i * 5000,
      category: c,
    }));
    return {
      identity: { name, tagline: brief.slice(0, 120), palette },
      seo: { title: `${name} · Loja oficial`, description: brief.slice(0, 160) },
      pages: [
        { type: 'hero', title: name, subtitle: brief },
        { type: 'categories', items: categories },
        { type: 'products' },
        { type: 'testimonials' },
        { type: 'faq' },
      ],
      categories,
      sampleProducts: products,
    };
  }

  async applyStore(brief: string) {
    const tenantId = requireTenantId();
    const draft = await this.buildStore(brief);
    const store = await this.prisma.store.findFirst({ where: { tenantId } });
    if (!store) return draft;
    await this.prisma.store.update({
      where: { id: store.id },
      data: {
        tagline: draft.identity.tagline,
        theme: draft.identity.palette,
        seoTitle: draft.seo.title,
        seoDescription: draft.seo.description,
        pages: [{ slug: 'home', blocks: draft.pages }],
      },
    });
    for (const c of draft.categories) {
      await this.prisma.productCategory.upsert({
        where: { storeId_slug: { storeId: store.id, slug: slugify(c) } },
        update: {},
        create: { storeId: store.id, name: c, slug: slugify(c) },
      });
    }
    return { applied: true, draft };
  }

  async buildProduct(brief: string) {
    const isCourse = /curso|aula|módulo|excel|formaç/i.test(brief);
    const name = isCourse ? `Curso: ${brief.replace(/quero vender/i, '').trim()}` : brief.slice(0, 80);
    const modules = isCourse
      ? [
          { title: 'Fundamentos', lessons: ['Boas-vindas', 'Ferramentas', 'Primeiros passos'] },
          { title: 'Prática', lessons: ['Exercício 1', 'Exercício 2', 'Projecto'] },
          { title: 'Avançado', lessons: ['Atalhos', 'Erros comuns', 'Certificação'] },
        ]
      : [];
    return {
      name,
      shortDescription: brief.slice(0, 140),
      description: `${brief}\n\nInclui acesso imediato, actualizações e suporte.`,
      type: isCourse ? 'COURSE' : 'PHYSICAL',
      suggestedPrice: isCourse ? 35000 : 15000,
      objectives: ['Aprender o essencial', 'Aplicar no dia-a-dia', 'Obter resultado mensurável'],
      faq: [
        { q: 'Quanto tempo tenho acesso?', a: 'Acesso vitalício ao conteúdo.' },
        { q: 'Há certificado?', a: isCourse ? 'Sim, após concluir 100% e o quiz.' : 'Não aplicável.' },
      ],
      orderBump: { name: 'Ebook complementar', price: 5000 },
      upsell: { name: 'Mentoria 1:1', price: 90000 },
      emails: [
        { trigger: 'purchase', subject: `Bem-vindo a ${name}` },
        { trigger: 'abandoned', subject: 'Esqueceu-se de algo?' },
      ],
      modules,
    };
  }

  async optimizeCheckout() {
    const insights = await this.analytics.insights();
    return {
      score: insights.kpis.conversion > 3 ? 82 : 61,
      recommendations: [
        { area: 'prova social', action: 'Adicionar 3 depoimentos com foto acima do pagamento' },
        { area: 'fricção', action: 'Pedir apenas nome, email e telefone no primeiro passo' },
        { area: 'urgencia', action: 'Countdown real ligado a stock ou campanha' },
        { area: 'order bump', action: 'Oferecer um digital de baixo ticket no checkout' },
      ],
    };
  }

  async pricing() {
    const tenantId = requireTenantId();
    const products = await this.prisma.product.findMany({
      where: { tenantId, status: 'PUBLISHED' },
      include: { orderItems: true },
    });
    return products.slice(0, 10).map((p) => {
      const units = p.orderItems.reduce((s, i) => s + i.quantity, 0);
      const suggested = units > 20 ? Number(p.price) * 1.08 : units < 3 ? Number(p.price) * 0.92 : Number(p.price);
      return { id: p.id, name: p.name, current: Number(p.price), suggested: Math.round(suggested), reason: units > 20 ? 'Alta procura' : units < 3 ? 'Baixa conversão' : 'Preço equilibrado' };
    });
  }

  async copy(kind: string, brief: string) {
    const map: Record<string, string> = {
      product: `${brief}\n\nFeito para quem quer resultado concreto, com entrega imediata e suporte em português.`,
      ad: `Pare de improvisar. ${brief} — comece hoje na Trauner.`,
      email: `Olá,\n\nNotámos que ${brief}. Reserve os seus 15 minutos e conclua a compra com 10% extra.\n\nEquipa Trauner`,
      page: `# ${brief}\n\nUma oferta directa, honesta e pronta a vender.`,
    };
    return { text: map[kind] || map.product };
  }

  private extractName(brief: string) {
    const m = brief.match(/loja de ([^.]+)/i);
    return m ? m[1].replace(/\b\w/g, (c) => c.toUpperCase()) : null;
  }

  private guessCategories(brief: string) {
    const b = brief.toLowerCase();
    if (b.includes('roupa') || b.includes('moda')) return ['Novidades', 'Homem', 'Mulher', 'Acessórios'];
    if (b.includes('fit') || b.includes('treino')) return ['Cursos', 'Suplementos', 'Roupa'];
    if (b.includes('comida') || b.includes('culin')) return ['Cursos', 'Alimentos', 'Utensílios'];
    return ['Destaques', 'Digitais', 'Físicos', 'Serviços'];
  }
}
