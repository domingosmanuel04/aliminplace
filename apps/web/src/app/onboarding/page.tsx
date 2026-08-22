'use client';
import { useState } from 'react';
import { api, setTenant } from '@/lib/api';

const templates = ['atelier', 'editorial', 'boutique', 'studio', 'harvest'];

export default function OnboardingPage() {
  const [storeName, setStoreName] = useState('');
  const [template, setTemplate] = useState('atelier');
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tenant = await api('/auth/onboarding', { method: 'POST', body: JSON.stringify({ storeName, template }) });
    setTenant(tenant.id);
    window.location.href = '/dashboard';
  }
  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <p className="text-xs uppercase tracking-widest text-gold">Onboarding</p>
      <h1 className="serif mt-2 text-4xl">Criar a sua loja</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div><label className="label">Nome da loja</label><input className="input" value={storeName} onChange={(e) => setStoreName(e.target.value)} required /></div>
        <div>
          <label className="label">Template</label>
          <div className="flex flex-wrap gap-2">
            {templates.map((t) => (
              <button type="button" key={t} onClick={() => setTemplate(t)} className={`btn-ghost capitalize ${template === t ? 'bg-ink text-cream' : ''}`}>{t}</button>
            ))}
          </div>
        </div>
        <button className="btn-primary" type="submit">Publicar rascunho e ir ao dashboard</button>
      </form>
    </main>
  );
}
