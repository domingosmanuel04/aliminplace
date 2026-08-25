import Link from "next/link";
import { MarketingNav } from "@/components/marketing-nav";
import { PLANS } from "@trauner/shared";

export default function PricingPage() {
  return (
    <div>
      <MarketingNav />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <h1 className="serif text-4xl sm:text-5xl">Planos</h1>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {Object.entries(PLANS).map(([key, p]) => (
            <article key={key} className="card p-6">
              <p className="text-xs uppercase tracking-widest text-gold">
                {key}
              </p>
              <h2 className="serif mt-2 text-3xl">{p.name}</h2>
              <p className="mt-2 text-2xl">
                {p.priceMonthlyAoa
                  ? `${p.priceMonthlyAoa.toLocaleString("pt-PT")} Kz/mês`
                  : "À medida"}
              </p>
              <ul className="mt-4 space-y-1 text-sm text-ink/70">
                <li>
                  {p.limits.products < 0
                    ? "Produtos ilimitados"
                    : `${p.limits.products} produtos`}
                </li>
                <li>
                  {p.limits.teamMembers < 0
                    ? "Equipa ilimitada"
                    : `${p.limits.teamMembers} utilizadores`}
                </li>
                <li>IA: {p.limits.ai ? "sim" : "não"}</li>
              </ul>
              <Link
                href="/register"
                className="btn-primary mt-6 w-full sm:w-auto"
              >
                Escolher
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
