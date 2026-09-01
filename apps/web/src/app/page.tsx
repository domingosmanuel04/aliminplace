"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MarketingNav } from "@/components/marketing-nav";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1800&q=85",
    eyebrow: "Comércio · Cursos · Assinaturas",
    title: "Crie. Venda. Cresça.",
    subtitle:
      "A plataforma angolana para vender produtos, cursos e serviços online.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1800&q=85",
    eyebrow: "Loja digital pronta",
    title: "A tua marca online em poucos minutos.",
    subtitle:
      "Publica produtos, controla stock e oferece uma experiência premium ao cliente.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1800&q=85",
    eyebrow: "Vendas e crescimento",
    title: "Transforma atenção em faturação.",
    subtitle:
      "Acompanhe métricas reais, campanhas e comissões no mesmo painel.",
  },
];

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
    q: "O que posso vender na Aluniplace?",
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
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-hidden">
      <MarketingNav />
      <main>
        <section className="relative isolate overflow-hidden bg-[#1E1E1E] text-white">
          {slides.map((slide, index) => (
            <div
              key={slide.title}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === activeIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-[#14110F]/95 via-[#14110F]/75 to-[#14110F]/20" />
          <div className="relative mx-auto grid min-h-[38rem] max-w-6xl items-center px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2">
            {slides.map((slide, index) => (
              <div
                key={slide.title}
                className={`max-w-2xl drop-shadow-[0_8px_24px_rgba(0,0,0,0.65)] transition-all duration-700 ${
                  index === activeIndex
                    ? "translate-x-0 opacity-100"
                    : "pointer-events-none absolute left-4 top-1/2 -translate-x-6 -translate-y-1/2 opacity-0"
                }`}
                aria-hidden={index !== activeIndex}
              >
                <p className="mb-5 inline-flex rounded-full bg-[#E31D1D] px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-white shadow-[0_8px_24px_rgba(227,29,29,0.35)]">
                  {slide.eyebrow}
                </p>
                <h1 className="serif max-w-4xl text-4xl leading-[1.05] text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.55)] sm:text-5xl md:text-7xl">
                  {slide.title}
                  <br />
                  Sem limites.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:mt-6 sm:text-lg">
                  {slide.subtitle}
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/register"
                    className="btn-primary w-full sm:w-auto"
                  >
                    Começar agora
                  </Link>
                  <Link
                    href="/marketplace"
                    className="btn-gold w-full sm:w-auto"
                  >
                    Ver marketplace
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                aria-label={`Ver slide ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex
                    ? "w-8 bg-[#E31D1D]"
                    : "w-2.5 bg-white/55"
                }`}
              />
            ))}
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {pillars.map((p) => (
              <article key={p.t} id="produto" className="card p-6">
                <h3 className="serif text-2xl">{p.t}</h3>
                <p className="mt-2 text-sm text-ink/65">{p.d}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="como-funciona" className="bg-ink text-cream">
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
        <section id="afiliados" className="bg-[#E31D1D] text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/75">
                  Programa de afiliados
                </p>
                <h2 className="serif mt-3 text-4xl text-white sm:text-5xl">
                  Recomende. Venda. Ganhe.
                </h2>
                <p className="mt-4 max-w-lg text-base leading-7 text-white/85">
                  Encontre produtos relevantes, partilhe o seu link e acompanhe
                  cada resultado num só lugar.
                </p>
                <Link href="/affiliate" className="btn-gold mt-7">
                  Explorar afiliados
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <article className="rounded-xl bg-white/10 p-5 ring-1 ring-white/15">
                  <p className="serif text-2xl text-white">01</p>
                  <h3 className="mt-3 font-semibold text-white">Escolha</h3>
                  <p className="mt-2 text-sm leading-6 text-white/75">
                    Descubra produtos para recomendar à sua audiência.
                  </p>
                </article>
                <article className="rounded-xl bg-white/10 p-5 ring-1 ring-white/15">
                  <p className="serif text-2xl text-white">02</p>
                  <h3 className="mt-3 font-semibold text-white">Partilhe</h3>
                  <p className="mt-2 text-sm leading-6 text-white/75">
                    Use o seu link e acompanhe o tracking das vendas.
                  </p>
                </article>
                <article className="rounded-xl bg-white/10 p-5 ring-1 ring-white/15">
                  <p className="serif text-2xl text-white">03</p>
                  <h3 className="mt-3 font-semibold text-white">Receba</h3>
                  <p className="mt-2 text-sm leading-6 text-white/75">
                    Consulte as suas comissões com transparência.
                  </p>
                </article>
              </div>
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
        <span>© {new Date().getFullYear()} Aluniplace</span>
        <div className="flex gap-4">
          <Link href="/pricing">Planos</Link>
          <Link href="/marketplace">Marketplace</Link>
        </div>
      </footer>
    </div>
  );
}
