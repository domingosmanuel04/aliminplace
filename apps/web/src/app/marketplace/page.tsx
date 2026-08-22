'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing-nav';
import { api, aoa } from '@/lib/api';

export default function MarketplacePage() {
  const [rows, setRows] = useState<any[]>([]);
  const [type, setType] = useState('');
  useEffect(() => {
    api(`/marketplace${type ? `?type=${type}` : ''}`).then(setRows);
  }, [type]);
  return (
    <div>
      <MarketingNav />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="serif text-5xl">Marketplace</h1>
        <div className="mt-6 flex flex-wrap gap-2">
          {['', 'COURSE', 'EBOOK', 'PHYSICAL', 'SOFTWARE'].map((t) => (
            <button key={t} className={`btn-ghost ${type === t ? 'bg-ink text-cream' : ''}`} onClick={() => setType(t)}>{t || 'Tudo'}</button>
          ))}
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => (
            <Link key={p.id} href={`/s/${p.store.slug}/products/${p.slug}`} className="card overflow-hidden">
              {p.media?.[0] && <img src={p.media[0].url} className="h-44 w-full object-cover" alt="" />}
              <div className="p-4">
                <p className="text-xs uppercase tracking-widest text-ink/40">{p.store.name}</p>
                <h3 className="serif mt-1 text-xl">{p.name}</h3>
                <p className="mt-1 text-sm">{aoa(Number(p.price))}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
