'use client';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/shell';
import { api, aoa } from '@/lib/api';

export default function OrdersPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api('/orders').then(setRows).catch(() => setRows([])); }, []);
  async function ship(id: string) {
    await api(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'SHIPPED', trackingCode: 'AO-TRK-001', carrier: 'Motoboy Luanda' }) });
    setRows(await api('/orders'));
  }
  return (
    <Shell>
      <h1 className="serif text-4xl">Pedidos</h1>
      <div className="card mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-ink/50"><tr><th className="p-3">Nº</th><th>Cliente</th><th>Total</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-t border-ink/5">
                <td className="p-3">{o.number}</td>
                <td>{o.customer?.name}</td>
                <td>{aoa(Number(o.total))}</td>
                <td>{o.status}</td>
                <td>{o.status === 'PROCESSING' && <button className="btn-ghost" onClick={() => ship(o.id)}>Marcar enviado</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
