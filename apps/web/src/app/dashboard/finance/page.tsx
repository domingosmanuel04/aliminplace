'use client';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/shell';
import { api, aoa } from '@/lib/api';

export default function FinancePage() {
  const [data, setData] = useState<any>(null);
  const [amount, setAmount] = useState(10000);
  useEffect(() => { api('/finance/wallet').then(setData); }, []);
  async function payout() {
    await api('/finance/payouts', { method: 'POST', body: JSON.stringify({ amount, method: 'TRANSFER', destination: { iban: 'AO06.0000.0000.0000' } }) });
    setData(await api('/finance/wallet'));
  }
  return (
    <Shell>
      <h1 className="serif text-4xl">Financeiro</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card p-6"><p className="text-xs uppercase text-ink/45">Disponível</p><p className="serif text-4xl">{aoa(data?.available)}</p></div>
        <div className="card p-6"><p className="text-xs uppercase text-ink/45">Pendente</p><p className="serif text-4xl">{aoa(data?.pending)}</p></div>
      </div>
      <div className="card mt-6 flex gap-3 p-6">
        <input className="input max-w-xs" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        <button className="btn-primary" onClick={payout}>Solicitar saque</button>
      </div>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-ink/50"><tr><th className="p-3">Data</th><th>Descrição</th><th>Dir.</th><th>Valor</th></tr></thead>
          <tbody>
            {(data?.statement || []).map((t: any) => (
              <tr key={t.id} className="border-t border-ink/5">
                <td className="p-3">{new Date(t.createdAt).toLocaleString('pt-PT')}</td>
                <td>{t.description}</td>
                <td>{t.direction}</td>
                <td>{aoa(Number(t.amount))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
