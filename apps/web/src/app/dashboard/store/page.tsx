'use client';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/shell';
import { api } from '@/lib/api';

export default function StoreBuilderPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [theme, setTheme] = useState<any>({ primary: '#1F3D32', accent: '#C4A574' });
  useEffect(() => {
    api('/stores').then((s) => {
      setStores(s);
      if (s[0]) {
        setPages(s[0].pages || []);
        setTheme(s[0].theme || theme);
      }
    });
  }, []);
  const store = stores[0];
  function add(type: string) {
    const home = pages[0] || { slug: 'home', blocks: [] };
    home.blocks = [...(home.blocks || []), { type, title: type }];
    setPages([{ ...home }]);
  }
  function move(i: number, dir: number) {
    const home = { ...pages[0] };
    const b = [...home.blocks];
    const j = i + dir;
    if (j < 0 || j >= b.length) return;
    [b[i], b[j]] = [b[j], b[i]];
    home.blocks = b;
    setPages([home]);
  }
  async function save() {
    await api(`/stores/${store.id}`, { method: 'PATCH', body: JSON.stringify({ pages, theme }) });
  }
  async function publish() {
    await save();
    await api(`/stores/${store.id}/publish`, { method: 'POST' });
  }
  return (
    <Shell>
      <div className="flex items-center justify-between">
        <h1 className="serif text-4xl">Construtor da loja</h1>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={save}>Guardar</button>
          <button className="btn-primary" onClick={publish}>Publicar</button>
          {store && <a className="btn-gold" href={`/s/${store.slug}`}>Ver loja</a>}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {['hero','banner','products','testimonials','faq','newsletter','benefits'].map((t) => (
          <button key={t} className="btn-ghost" onClick={() => add(t)}>+ {t}</button>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        <label className="label">Cor primária</label>
        <input type="color" value={theme.primary} onChange={(e) => setTheme({ ...theme, primary: e.target.value })} />
        <label className="label">Acento</label>
        <input type="color" value={theme.accent} onChange={(e) => setTheme({ ...theme, accent: e.target.value })} />
      </div>
      <ul className="mt-6 space-y-2">
        {(pages[0]?.blocks || []).map((b: any, i: number) => (
          <li key={i} className="card flex items-center justify-between p-4">
            <span className="capitalize">{b.type} {b.title || ''}</span>
            <span className="flex gap-2">
              <button className="btn-ghost" onClick={() => move(i, -1)}>↑</button>
              <button className="btn-ghost" onClick={() => move(i, 1)}>↓</button>
            </span>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
