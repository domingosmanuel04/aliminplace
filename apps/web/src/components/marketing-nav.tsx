import Link from 'next/link';

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/5 bg-cream/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="serif text-2xl tracking-tight">
          Trauner
        </Link>
        <nav className="hidden gap-8 text-sm md:flex">
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/pricing">Planos</Link>
          <a href="#produto">Produto</a>
        </nav>
        <div className="flex gap-3">
          <Link href="/login" className="btn-ghost">Entrar</Link>
          <Link href="/register" className="btn-primary">Começar gratuitamente</Link>
        </div>
      </div>
    </header>
  );
}
