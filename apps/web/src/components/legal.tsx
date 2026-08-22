import { MarketingNav } from '@/components/marketing-nav';

export default function Legal({ title, children }: { title: string; children: string }) {
  return (
    <div>
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="serif text-4xl">{title}</h1>
        <p className="mt-6 text-ink/70">{children}</p>
      </main>
    </div>
  );
}
