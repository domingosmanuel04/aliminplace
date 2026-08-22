'use client';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/shell';
import { api } from '@/lib/api';

export default function Page() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api('/affiliates/producer').then(setRows).catch(() => setRows([])); }, []);
  return (
    <Shell>
      <h1 className="serif text-4xl">Afiliados</h1>
      <div className="card mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-ink/50"><tr><th className="p-3">Afiliado</th><th>Produto</th><th>Cliques</th><th>Estado</th></tr></thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="border-t border-ink/5">
                <td className="p-3">{l.affiliate?.user?.name}</td>
                <td>{l.product?.name}</td>
                <td>{l.clicks}</td>
                <td>{l.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
