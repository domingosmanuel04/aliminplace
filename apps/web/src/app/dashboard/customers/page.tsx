'use client';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/shell';
import { api, aoa } from '@/lib/api';

export default function CustomersPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api('/customers').then(setRows).catch(() => setRows([])); }, []);
  return (
    <Shell>
      <h1 className="serif text-4xl">Clientes</h1>
      <div className="card mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-ink/50"><tr><th className="p-3">Nome</th><th>Email</th><th>Gasto</th><th>Tags</th></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-ink/5">
                <td className="p-3">{c.name}</td><td>{c.email}</td><td>{aoa(Number(c.totalSpent))}</td><td>{(c.tags || []).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
