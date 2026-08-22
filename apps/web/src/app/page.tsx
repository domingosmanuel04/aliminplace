import Link from 'next/link';
import { MarketingNav } from '@/components/marketing-nav';

const pillars = [
  { t: 'Loja', d: 'Página, catálogo, domínio e identidade — digitais e físicos no mesmo sítio.' },
  { t: 'Checkout', d: 'Order bump, upsell, cupões e métodos locais. Vários checkouts por produto.' },
  { t: 'Pagamentos', d: 'Gateway desacoplado, sandbox real e arquitectura pronta para cartão, referência e transferência.' },
  { t: 'Área de membros', d: 'Cursos, progresso, quizzes, certificados e player com retoma.' },
  { t: 'Afiliados', d: 'Marketplace interno, tracking, comissões e coprodução.' },
  { t: 'IA', d: 'Copiloto que lê as suas vendas — não um chatbot genérico.' },
];

export default function HomePage() {
  return (
    <div>
      <MarketingNav />
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-gold">Comércio · Cursos · Assinaturas</p>
        <h1 className="serif max-w-4xl text-5xl leading-[1.05] md:text-7xl">
          Venda qualquer coisa.<br />Em qualquer lugar.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink/70">
          Uma plataforma completa para criar a sua loja, vender produtos, cursos, serviços e assinaturas.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register" className="btn-primary">Começar gratuitamente</Link>
          <Link href="/marketplace" className="btn-gold">Explorar marketplace</Link>
        </div>
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {pillars.map((p) => (
            <article key={p.t} id="produto" className="card p-6">
              <h3 className="serif text-2xl">{p.t}</h3>
              <p className="mt-2 text-sm text-ink/65">{p.d}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-ink text-cream">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2">
          <div>
            <h2 className="serif text-4xl">Do zero à primeira venda, no mesmo dia.</h2>
            <ol className="mt-6 space-y-3 text-cream/80">
              <li>1. Criar conta</li>
              <li>2. Criar loja e escolher template</li>
              <li>3. Publicar produto</li>
              <li>4. Configurar pagamento sandbox ou real</li>
              <li>5. Receber e acompanhar analytics</li>
            </ol>
          </div>
          <div className="card bg-cream p-6 text-ink">
            <p className="text-xs uppercase tracking-widest text-ink/50">Demonstração</p>
            <p className="serif mt-2 text-3xl">Atlas Fit vendeu 50.000 Kz hoje</p>
            <p className="mt-2 text-sm text-ink/60">Ticket médio a subir 12% vs. ontem · abandono de checkout em queda.</p>
          </div>
        </div>
      </section>
      <footer className="mx-auto flex max-w-6xl justify-between px-6 py-10 text-sm text-ink/50">
        <span>© {new Date().getFullYear()} Trauner</span>
        <div className="flex gap-4">
          <Link href="/pricing">Planos</Link>
          <Link href="/marketplace">Marketplace</Link>
        </div>
      </footer>
    </div>
  );
}
