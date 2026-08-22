'use client';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/shell';
import { api } from '@/lib/api';

export default function Page() {
  const [rows, setRows] = useState<any[]>([]);
  const [code, setCode] = useState('PROMO10');
  useEffect(() => { api('/coupons').then(setRows).catch(() => setRows([])); }, []);
  async function create() {
    await api('/coupons', { method: 'POST', body: JSON.stringify({ code, type: 'PERCENT', value: 10 }) });
    setRows(await api('/coupons'));
  }
  return (
    <Shell>
      <h1 className="serif text-4xl">Cupões</h1>
      <div className="mt-4 flex gap-2">
        <input className="input max-w-xs" value={code} onChange={(e) => setCode(e.target.value)} />
        <button className="btn-primary" onClick={create}>Criar 10%</button>
      </div>
      <ul className="card mt-6 divide-y divide-ink/5">
        {rows.map((c) => <li key={c.id} className="p-4 text-sm">{c.code} · {c.type} {c.value}</li>)}
      </ul>
    </Shell>
  );
}
