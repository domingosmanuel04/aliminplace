'use client';
import { useEffect, useState } from 'react';
import { api, aoa } from '@/lib/api';

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [err, setErr] = useState('');
  useEffect(() => {
    api('/admin/overview').then(setData).catch((e) => setErr(e.message));
    api('/admin/tenants').then(setTenants).catch(() => undefined);
  }, []);
  async function suspend(id: string) {
    await api(`/admin/tenants/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'SUSPENDED' }) });
    setTenants(await api('/admin/tenants'));
  }
  return (
    <main className="min-h-screen bg-ink p-8 text-cream">
      <h1 className="serif text-4xl">Super Admin</h1>
      {err && <p className="mt-4 text-gold">{err} — entre com emma.t@example.net</p>}
      {data && (
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[['GMV', aoa(data.gmv)], ['Receita plataforma', aoa(data.platformRevenue)], ['Utilizadores', data.users], ['Tenants', data.tenants], ['Produtos', data.products], ['Pedidos', data.orders], ['Saques pendentes', data.pendingPayouts], ['Tickets', data.openTickets]].map(([k, v]) => (
            <div key={String(k)} className="rounded-2xl border border-white/10 p-5">
              <p className="text-xs uppercase tracking-widest text-gold">{k}</p>
              <p className="serif mt-2 text-3xl">{v}</p>
            </div>
          ))}
        </div>
      )}
      <h2 className="serif mt-12 text-2xl">Tenants</h2>
      <ul className="mt-4 space-y-2">
        {tenants.map((t) => (
          <li key={t.id} className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm">
            <span>{t.name} · {t.plan} · {t.status}</span>
            <button className="btn-gold" onClick={() => suspend(t.id)}>Suspender</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
