'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/shell';
import { api, aoa } from '@/lib/api';

export default function ProductsPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    api('/products').then(setRows).catch(() => setRows([]));
  }, []);
  return (
    <Shell>
      <div className="flex items-center justify-between">
        <h1 className="serif text-4xl">Produtos</h1>
        <Link href="/dashboard/products/new" className="btn-primary">Novo produto</Link>
      </div>
      <div className="mt-8 overflow-x-auto card">
        <table className="w-full text-sm">
          <thead className="text-left text-ink/50"><tr><th className="p-3">Nome</th><th>Tipo</th><th>Preço</th><th>Estado</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-ink/5">
                <td className="p-3">{p.name}</td>
                <td>{p.type}</td>
                <td>{aoa(Number(p.price))}</td>
                <td>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
