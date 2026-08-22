'use client';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/shell';
import { api } from '@/lib/api';

export default function Page() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api('/analytics/dashboard').then((d) => setRows(d.charts?.byProduct || [])); }, []);
  return (
    <Shell>
      <h1 className="serif text-4xl">Analytics</h1>
      <div className="card mt-8 p-6">
        <h2 className="serif text-2xl">Vendas por produto</h2>
        <ul className="mt-4 space-y-2">
          {rows.map((r) => (
            <li key={r.name} className="flex justify-between text-sm"><span>{r.name}</span><span>{r.total}</span></li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}
