"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, aoa, sessionId } from "@/lib/api";

export default function StoreHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [store, setStore] = useState<any>(null);
  const [slug, setSlug] = useState("");
  useEffect(() => {
    params.then((p) => {
      setSlug(p.slug);
      api(`/public/stores/${p.slug}`).then(setStore);
    });
  }, [params]);
  if (!store) return <p className="p-10">A carregar loja…</p>;
  const theme = store.theme || {};
  return (
    <div
      style={{
        background: theme.bg || "#F6F1E8",
        color: theme.primary || "#14110F",
        minHeight: "100vh",
      }}
    >
      <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-6">
        <h1 className="serif text-3xl">{store.name}</h1>
        <Link href={`/s/${slug}/cart`}>Carrinho</Link>
      </header>
      <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 sm:pb-16">
        <p
          className="text-xs uppercase tracking-[0.3em]"
          style={{ color: theme.accent }}
        >
          {store.template}
        </p>
        <h2 className="serif mt-3 text-3xl leading-tight sm:text-5xl">
          {store.tagline}
        </h2>
        <p className="mt-4 max-w-2xl text-lg opacity-70">{store.description}</p>
        <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {store.products?.map((p: any) => (
            <Link
              key={p.id}
              href={`/s/${slug}/products/${p.slug}`}
              className="card overflow-hidden"
            >
              {p.media?.[0] && (
                <img
                  src={p.media[0].url}
                  alt={p.name}
                  className="h-48 w-full object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="serif text-xl">{p.name}</h3>
                <p className="mt-1 text-sm opacity-60">
                  {aoa(Number(p.price))}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
