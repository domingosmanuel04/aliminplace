"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing-nav";
import { api, aoa } from "@/lib/api";

export default function MarketplacePage() {
  const [rows, setRows] = useState<any[]>([]);
  const [type, setType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    api(`/marketplace${type ? `?type=${type}` : ""}`)
      .then(setRows)
      .catch(() => {
        setRows([]);
        setHasError(true);
      })
      .finally(() => setIsLoading(false));
  }, [type]);
  return (
    <div>
      <MarketingNav />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <h1 className="serif text-4xl sm:text-5xl">Marketplace</h1>
        <div className="mt-6 flex flex-wrap gap-2">
          {["", "COURSE", "EBOOK", "PHYSICAL", "SOFTWARE"].map((t) => (
            <button
              key={t}
              className={`btn-ghost ${type === t ? "bg-ink text-cream" : ""}`}
              onClick={() => setType(t)}
            >
              {t || "Tudo"}
            </button>
          ))}
        </div>
        {isLoading ? (
          <p className="mt-10 text-sm text-ink/55">A carregar produtos...</p>
        ) : rows.length ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((p) => (
              <Link
                key={p.id}
                href={`/s/${p.store.slug}/products/${p.slug}`}
                className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative flex h-48 items-center justify-center overflow-hidden bg-ink/5">
                  {p.media?.[0] ? (
                    <img
                      src={p.media[0].url}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      alt={p.media[0].alt || p.name}
                    />
                  ) : (
                    <span className="serif text-4xl text-ink/20">
                      {p.name.charAt(0)}
                    </span>
                  )}
                  {p.category?.name && (
                    <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink/65">
                      {p.category.name}
                    </span>
                  )}
                </div>
                <div className="flex min-h-40 flex-col p-5">
                  <p className="text-xs uppercase tracking-widest text-ink/40">
                    {p.store.name}
                  </p>
                  <h3 className="serif mt-2 text-2xl leading-tight">
                    {p.name}
                  </h3>
                  {p.shortDescription && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/60">
                      {p.shortDescription}
                    </p>
                  )}
                  <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                    <div>
                      <p className="text-lg font-semibold text-forest">
                        {aoa(Number(p.price))}
                      </p>
                      {p.compareAtPrice &&
                        Number(p.compareAtPrice) > Number(p.price) && (
                          <p className="text-xs text-ink/40 line-through">
                            {aoa(Number(p.compareAtPrice))}
                          </p>
                        )}
                    </div>
                    <span className="text-sm font-medium text-ink/60 group-hover:text-ink">
                      Ver produto
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : hasError ? (
          <p className="mt-10 text-sm text-ink/55">
            Não foi possível carregar os produtos.
          </p>
        ) : (
          <p className="mt-10 text-sm text-ink/55">
            Ainda não existem produtos nesta categoria.
          </p>
        )}
      </main>
    </div>
  );
}
