'use client';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/shell';
import { api } from '@/lib/api';

export default function Page() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api('/products').then((p) => setRows(p.filter((x: any) => x.type === 'COURSE'))); }, []);
  return (
    <Shell>
      <h1 className="serif text-4xl">Cursos</h1>
      <ul className="mt-6 space-y-3">
        {rows.map((c) => <li key={c.id} className="card p-5">{c.name}</li>)}
      </ul>
    </Shell>
  );
}
