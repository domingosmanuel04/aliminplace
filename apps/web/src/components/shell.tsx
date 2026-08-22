'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';

const links = [
  ['/dashboard', 'Visão geral'],
  ['/dashboard/products', 'Produtos'],
  ['/dashboard/orders', 'Pedidos'],
  ['/dashboard/customers', 'Clientes'],
  ['/dashboard/checkouts', 'Checkouts'],
  ['/dashboard/store', 'Loja'],
  ['/dashboard/courses', 'Cursos'],
  ['/dashboard/affiliates', 'Afiliados'],
  ['/dashboard/coupons', 'Cupões'],
  ['/dashboard/finance', 'Financeiro'],
  ['/dashboard/analytics', 'Analytics'],
  ['/dashboard/ai', 'IA'],
  ['/dashboard/team', 'Equipa'],
  ['/dashboard/settings', 'Definições'],
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-ink/10 bg-ink text-cream md:min-h-screen md:border-b-0 md:border-r md:border-white/5">
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/dashboard" className="serif text-2xl">Trauner</Link>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 pb-3 md:flex-col">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm ${path === href ? 'bg-gold text-ink' : 'text-cream/70 hover:bg-white/5'}`}>
              {label}
            </Link>
          ))}
          <Link href="/members" className="rounded-xl px-3 py-2 text-sm text-cream/50">Área de membros</Link>
          <button onClick={logout} className="rounded-xl px-3 py-2 text-left text-sm text-cream/50">Sair</button>
        </nav>
      </aside>
      <div className="p-6 md:p-10">{children}</div>
    </div>
  );
}
