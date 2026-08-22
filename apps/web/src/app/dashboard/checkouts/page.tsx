'use client';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/shell';
import { api } from '@/lib/api';

export default function Page() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api('/checkouts').then(setRows).catch(() => setRows([])); }, []);
  return (
    <Shell>
      <h1 className="serif text-4xl">Checkouts</h1>
      <p className="mt-2 text-sm text-ink/60">Cada produto pode ter campanhas distintas: Facebook, afiliado, Black Friday.</p>
      <ul className="mt-6 space-y-3">
        {rows.map((c) => (
          <li key={c.id} className="card p-5">
            <p className="serif text-xl">{c.name}</p>
            <p className="text-sm text-ink/50">/{c.slug} · {c.isDefault ? 'padrão' : 'campanha'}</p>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
