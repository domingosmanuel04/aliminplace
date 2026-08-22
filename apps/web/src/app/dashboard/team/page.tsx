'use client';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/shell';
import { api } from '@/lib/api';

export default function Page() {
  const [rows, setRows] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  useEffect(() => { api('/team').then(setRows).catch(() => setRows([])); }, []);
  async function invite() {
    await api('/team', { method: 'POST', body: JSON.stringify({ email, role: 'SUPORTE', permissions: ['orders.read', 'support.manage'] }) });
    setRows(await api('/team'));
  }
  return (
    <Shell>
      <h1 className="serif text-4xl">Equipa</h1>
      <div className="mt-4 flex gap-2">
        <input className="input max-w-xs" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn-primary" onClick={invite}>Convidar suporte</button>
      </div>
      <ul className="card mt-6 divide-y divide-ink/5">
        {rows.map((m) => <li key={m.id} className="p-4 text-sm">{m.user?.name} · {m.role}</li>)}
      </ul>
    </Shell>
  );
}
