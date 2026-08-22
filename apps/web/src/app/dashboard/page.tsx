'use client';
import { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Shell } from '@/components/shell';
import { api, aoa } from '@/lib/api';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api('/analytics/dashboard')
      .then(setData)
      .catch((e) => setErr(e.message));
  }, []);
  const k = data?.kpis || {};
  const delta = (a: number, b: number) => (b ? `${(((a - b) / b) * 100).toFixed(1)}%` : '—');
  return (
    <Shell>
      <h1 className="serif text-4xl">Hoje na sua loja</h1>
      {err && <p className="mt-4 text-clay">{err}</p>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Faturamento hoje" value={aoa(k.revenueToday)} hint={`vs ontem ${delta(k.revenueToday, k.revenueYesterday)}`} />
        <Kpi title="Este mês" value={aoa(k.revenueMonth)} hint={`vs mês anterior ${delta(k.revenueMonth, k.revenuePrevMonth)}`} />
        <Kpi title="Ticket médio" value={aoa(k.avgTicket)} hint={`${k.salesMonth || 0} vendas`} />
        <Kpi title="Conversão" value={`${(k.conversion || 0).toFixed(1)}%`} hint={`${k.cartAbandon || 0} abandonos`} />
        <Kpi title="Clientes" value={k.customers} />
        <Kpi title="Produtos" value={k.products} />
        <Kpi title="Saldo disponível" value={aoa(k.walletAvailable)} hint={`Pendente ${aoa(k.walletPending)}`} />
        <Kpi title="Comissões" value={aoa(k.commissions)} hint={`${k.affiliates || 0} afiliados`} />
      </div>
      <div className="card mt-8 p-6">
        <h2 className="serif text-2xl">Vendas por dia</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.charts?.byDay || []}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip />
              <Area dataKey="total" stroke="#1F3D32" fill="#C4A574" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Shell>
  );
}

function Kpi({ title, value, hint }: { title: string; value: any; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-widest text-ink/45">{title}</p>
      <p className="serif mt-2 text-3xl">{value ?? '—'}</p>
      {hint && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
    </div>
  );
}
