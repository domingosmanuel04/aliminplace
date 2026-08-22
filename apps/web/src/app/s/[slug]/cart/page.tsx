'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, aoa, sessionId } from '@/lib/api';

export default function CartPage({ params }: { params: Promise<{ slug: string }> }) {
  const [quote, setQuote] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [code, setCode] = useState('BEMVINDO10');
  useEffect(() => {
    params.then(async (p) => {
      const s = await api(`/public/stores/${p.slug}`);
      setStore(s);
      setQuote(await api(`/cart?storeId=${s.id}&sessionId=${sessionId()}`));
    });
  }, [params]);
  async function apply() {
    const q = await api('/cart/coupon', { method: 'POST', body: JSON.stringify({ storeId: store.id, sessionId: sessionId(), code }) });
    setQuote(q);
  }
  if (!quote) return <p className="p-10">Carrinho…</p>;
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="serif text-4xl">Carrinho</h1>
      <ul className="mt-6 space-y-3">
        {quote.cart.items.map((i: any) => (
          <li key={i.id} className="card flex justify-between p-4">
            <span>{i.product.name} × {i.quantity}</span>
            <span>{aoa(Number(i.price) * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <input className="input" value={code} onChange={(e) => setCode(e.target.value)} />
        <button className="btn-ghost" onClick={apply}>Aplicar cupão</button>
      </div>
      <p className="mt-4">Subtotal {aoa(quote.subtotal)} · Desconto {aoa(quote.discount)} · Total {aoa(quote.total)}</p>
      <Link href={`/s/${store?.slug}/checkout`} className="btn-primary mt-6 inline-flex">Checkout</Link>
    </main>
  );
}
