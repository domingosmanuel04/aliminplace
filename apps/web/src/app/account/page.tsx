'use client';
import { useEffect, useState } from 'react';
import { api, aoa } from '@/lib/api';

export default function AccountPage() {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => { api('/account/orders').then(setOrders).catch(() => setOrders([])); }, []);
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="serif text-4xl">Minha conta</h1>
      <ul className="mt-8 space-y-3">
        {orders.map((o) => (
          <li key={o.id} className="card p-5">
            <p>{o.number} · {o.status} · {aoa(Number(o.total))}</p>
            <p className="text-sm text-ink/50">{o.store?.name}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
