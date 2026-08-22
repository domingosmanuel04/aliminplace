'use client';
import { useState } from 'react';
import { Shell } from '@/components/shell';
import { api } from '@/lib/api';

export default function NewProductPage() {
  const [form, setForm] = useState({ name: '', type: 'PHYSICAL', price: 10000, shortDescription: '', description: '' });
  const [msg, setMsg] = useState('');
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p = await api('/products', { method: 'POST', body: JSON.stringify({ ...form, price: Number(form.price), status: 'PUBLISHED' }) });
    setMsg(`Publicado: ${p.name}`);
  }
  return (
    <Shell>
      <h1 className="serif text-4xl">Novo produto</h1>
      <form onSubmit={onSubmit} className="card mt-8 max-w-xl space-y-4 p-6">
        <div><label className="label">Nome</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
        <div>
          <label className="label">Tipo</label>
          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {['COURSE','EBOOK','FILE','VIDEO','PHYSICAL','SUBSCRIPTION','SERVICE','SOFTWARE'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div><label className="label">Preço (Kz)</label><input className="input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
        <div><label className="label">Descrição curta</label><input className="input" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} /></div>
        <div><label className="label">Descrição</label><textarea className="input" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <button className="btn-primary" type="submit">Publicar</button>
        {msg && <p className="text-sm text-forest">{msg}</p>}
      </form>
    </Shell>
  );
}
