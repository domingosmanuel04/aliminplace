'use client';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/shell';
import { api } from '@/lib/api';

export default function Page() {
  const [me, setMe] = useState<any>(null);
  const [host, setHost] = useState('minhaloja.com');
  useEffect(() => { api('/auth/me').then(setMe); }, []);
  const store = me?.memberships?.[0]?.tenant?.stores?.[0];
  async function addDomain() {
    if (!store) return;
    await api('/domains', { method: 'POST', body: JSON.stringify({ storeId: store.id, host }) });
    alert('Domínio adicionado. Configure o DNS para o IP da Aluniplace e clique em verificar na API.');
  }
  return (
    <Shell>
      <h1 className="serif text-4xl">Definições</h1>
      <div className="card mt-6 max-w-lg space-y-4 p-6">
        <p className="text-sm">Conta: {me?.email}</p>
        <p className="text-sm">Loja: {store?.slug}.localhost</p>
        <div><label className="label">Domínio personalizado</label><input className="input" value={host} onChange={(e) => setHost(e.target.value)} /></div>
        <button className="btn-primary" onClick={addDomain}>Adicionar domínio</button>
      </div>
    </Shell>
  );
}
