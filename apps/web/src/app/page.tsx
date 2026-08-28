import Link from "next/link";
import Image from "next/image";
import { MarketingNav } from "@/components/marketing-nav";

const pillars = [
  {
    t: "Loja",
    d: "Página, catálogo, domínio e identidade — digitais e físicos no mesmo sítio.",
  },
  {
    t: "Checkout",
    d: "Order bump, upsell, cupões e métodos locais. Vários checkouts por produto.",
  },
  {
    t: "Pagamentos",
    d: "Gateway desacoplado, sandbox real e arquitectura pronta para cartão, referência e transferência.",
  },
  {
    t: "Área de membros",
    d: "Cursos, progresso, quizzes, certificados e player com retoma.",
  },
  {
    t: "Afiliados",
    d: "Marketplace interno, tracking, comissões e coprodução.",
  },
  { t: "IA", d: "Copiloto que lê as suas vendas — não um chatbot genérico." },
];

const faqs = [
  {
    q: "O que posso vender na Trauner?",
    a: "Produtos digitais, cursos, ebooks, serviços e assinaturas, com uma loja própria para cada negócio.",
  },
  {
    q: "Posso vender a partir de Angola?",
    a: "Sim. A plataforma foi pensada para negócios angolanos, com preços em Kz e checkout preparado para pagamentos locais.",
  },
  {
    q: "Como os clientes recebem o produto?",
    a: "Após a confirmação do pagamento, o cliente recebe acesso ao conteúdo ou à área de membros de forma automática.",
  },
  {
    q: "Preciso de conhecimentos técnicos?",
    a: "Não. Crie a conta, publique o produto e acompanhe as vendas num único painel.",
  },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <MarketingNav />
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-gold">
              Comércio · Cursos · Assinaturas
            </p>
            <h1 className="serif max-w-4xl text-4xl leading-[1.05] sm:text-5xl md:text-7xl">
              Crie. Venda. Cresça.
              <br />
              Sem limites.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-ink/70 sm:mt-6 sm:text-lg">
              A plataforma angolana para vender produtos, cursos e serviços
              online.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <Link href="/register" className="btn-primary w-full sm:w-auto">
                Começar agora
              </Link>
              <Link href="/marketplace" className="btn-gold w-full sm:w-auto">
                Ver marketplace
              </Link>
            </div>
          </div>
          <div className="relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-[#E5E7EB] bg-[#1E1E1E] shadow-card sm:min-h-[30rem]">
            <Image
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=85"
              alt="Pessoa a gerir uma loja digital num portátil e telemóvel"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#14110F]/80 to-transparent px-6 pb-6 pt-20">
              <p className="text-xs uppercase tracking-[0.25em] text-white/70">
                Feito para quem vende
              </p>
              <p className="serif mt-2 text-2xl text-white sm:text-3xl">
                A sua ideia. A sua loja.
              </p>
            </div>
            <div className="absolute right-5 top-5 h-3 w-3 rounded-full bg-[#E31D1D] shadow-[0_0_0_6px_rgba(227,29,29,0.2)]" />
          </div>
          <div className="mt-12 grid gap-4 sm:mt-16 md:grid-cols-3 lg:col-span-2">
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
              <h2 className="serif text-4xl">
                Do zero à primeira venda, no mesmo dia.
              </h2>
              <ol className="mt-6 space-y-3 text-cream/80">
                <li>1. Criar conta</li>
                <li>2. Criar loja e escolher template</li>
                <li>3. Publicar produto</li>
                <li>4. Configurar pagamento sandbox ou real</li>
                <li>5. Receber e acompanhar analytics</li>
              </ol>
            </div>
            <div className="card bg-cream p-6 text-ink">
              <p className="text-xs uppercase tracking-widest text-ink/50">
                Demonstração
              </p>
              <p className="serif mt-2 text-3xl">
                Atlas Fit vendeu 50.000 Kz hoje
              </p>
              <p className="mt-2 text-sm text-ink/60">
                Ticket médio a subir 12% vs. ontem · abandono de checkout em
                queda.
              </p>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-gold">
              Perguntas frequentes
            </p>
            <h2 className="serif mt-3 text-4xl sm:text-5xl">
              Tudo claro antes de começar.
            </h2>
            <p className="mt-4 text-base leading-7 text-ink/65">
              As respostas essenciais para transformar a sua ideia num negócio
              online.
            </p>
          </div>
          <div className="mt-10 grid gap-x-12 gap-y-0 border-y border-[#E5E7EB] md:grid-cols-2">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group border-b border-[#E5E7EB] py-5 last:border-b-0 md:even:border-b-0"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ink marker:hidden">
                  {faq.q}
                  <span className="shrink-0 text-xl font-normal text-gold transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-lg pr-8 text-sm leading-6 text-ink/65">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>
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
