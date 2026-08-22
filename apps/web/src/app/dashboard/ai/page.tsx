'use client';
import { useState } from 'react';
import { Shell } from '@/components/shell';
import { api } from '@/lib/api';

export default function AiPage() {
  const [prompt, setPrompt] = useState('As minhas vendas esta semana');
  const [out, setOut] = useState<any>(null);
  async function run(path: string, body: any) {
    setOut(await api(path, { method: 'POST', body: JSON.stringify(body) }));
  }
  return (
    <Shell>
      <h1 className="serif text-4xl">Copiloto de vendas</h1>
      <p className="mt-2 text-ink/60">A IA lê os seus dados reais — não inventa um chatbot.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <button className="btn-ghost" onClick={() => run('/ai/copilot', { prompt })}>Analisar</button>
        <button className="btn-ghost" onClick={() => run('/ai/store', { brief: 'Quero uma loja de roupas masculinas premium.', apply: true })}>Criar loja com IA</button>
        <button className="btn-ghost" onClick={() => run('/ai/product', { brief: 'Quero vender um curso de Excel para iniciantes.' })}>Criar curso com IA</button>
        <button className="btn-ghost" onClick={() => run('/ai/checkout-optimizer', {})}>Optimizar checkout</button>
        <button className="btn-ghost" onClick={() => run('/ai/pricing', {})}>Sugerir preços</button>
      </div>
      <textarea className="input mt-4" rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <pre className="card mt-6 overflow-auto p-4 text-xs">{out ? JSON.stringify(out, null, 2) : 'Sem resposta ainda.'}</pre>
    </Shell>
  );
}
