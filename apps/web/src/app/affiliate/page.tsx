'use client';
import { useEffect, useState } from 'react';
import { api, aoa } from '@/lib/api';

export default function AffiliateDash() {
  const [me, setMe] = useState<any>(null);
  const [catalog, setCatalog] = useState<any[]>([]);
  useEffect(() => {
    api('/affiliates/me').then(setMe).catch(() => undefined);
    api('/affiliates/catalog').then(setCatalog);
  }, []);
  async function apply(productId: string) {
    await api('/affiliates/apply', { method: 'POST', body: JSON.stringify({ productId }) });
    setMe(await api('/affiliates/me'));
  }
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="serif text-4xl">Afiliados</h1>
      <p className="mt-2 text-sm">Código: {me?.code || '—'} · Vendas {me?.sales?.length || 0}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {catalog.map((p) => (
          <article key={p.id} className="card p-5">
            <h3 className="serif text-xl">{p.name}</h3>
            <p className="text-sm">{aoa(Number(p.price))} · comissão {Number(p.affiliateCommission)}%</p>
            <button className="btn-primary mt-3" onClick={() => apply(p.id)}>Pedir afiliação</button>
          </article>
        ))}
      </div>
    </main>
  );
}
