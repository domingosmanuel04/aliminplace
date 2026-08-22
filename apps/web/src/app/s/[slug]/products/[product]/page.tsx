'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, aoa, sessionId } from '@/lib/api';

export default function ProductPage({ params }: { params: Promise<{ slug: string; product: string }> }) {
  const [data, setData] = useState<any>(null);
  const [p, setP] = useState<{ slug: string; product: string } | null>(null);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    params.then(async (x) => {
      setP(x);
      setData(await api(`/public/stores/${x.slug}/products/${x.product}`));
    });
  }, [params]);
  async function add() {
    if (!data || !p) return;
    await api('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ storeId: data.storeId, sessionId: sessionId(), productId: data.id, quantity: 1 }),
    });
    setMsg('Adicionado ao carrinho');
  }
  if (!data) return <p className="p-10">A carregar…</p>;
  return (
    <main className="mx-auto grid max-w-5xl gap-10 px-6 py-12 md:grid-cols-2">
      <img src={data.media?.[0]?.url} alt="" className="rounded-3xl" />
      <div>
        <Link href={`/s/${p?.slug}`} className="text-sm opacity-60">← Loja</Link>
        <h1 className="serif mt-4 text-4xl">{data.name}</h1>
        <p className="mt-3 text-ink/70">{data.shortDescription}</p>
        <p className="serif mt-6 text-3xl">{aoa(Number(data.price))}</p>
        <div className="mt-6 flex gap-3">
          <button className="btn-primary" onClick={add}>Adicionar ao carrinho</button>
          <Link className="btn-gold" href={`/s/${p?.slug}/checkout`}>Checkout</Link>
        </div>
        {msg && <p className="mt-3 text-sm text-forest">{msg}</p>}
        <article className="prose mt-8 text-sm text-ink/70">{data.description}</article>
        <div className="mt-8">
          <h2 className="serif text-2xl">Avaliações</h2>
          {(data.reviews || []).map((r: any) => (
            <p key={r.id} className="mt-2 text-sm">★ {r.rating} — {r.comment}</p>
          ))}
        </div>
      </div>
    </main>
  );
}
