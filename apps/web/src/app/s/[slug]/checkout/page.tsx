'use client';
import { useEffect, useState } from 'react';
import { api, aoa, sessionId } from '@/lib/api';

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const [store, setStore] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);
  const [name, setName] = useState('Cliente Demo');
  const [email, setEmail] = useState('cliente1@mail.ao');
  const [method, setMethod] = useState<'CARD' | 'REFERENCE' | 'TRANSFER'>('CARD');
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    params.then(async (p) => {
      const s = await api(`/public/stores/${p.slug}`);
      setStore(s);
      setQuote(await api(`/cart?storeId=${s.id}&sessionId=${sessionId()}`));
    });
  }, [params]);
  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      const r = await api('/checkout', {
        method: 'POST',
        body: JSON.stringify({
          storeId: store.id,
          sessionId: sessionId(),
          email,
          name,
          method,
          token: '4242424242424242',
          device: window.innerWidth < 768 ? 'mobile' : 'desktop',
        }),
      });
      setResult(r);
    } catch (e: any) {
      setErr(e.message);
    }
  }
  if (result?.payment?.status === 'APPROVED') {
    return (
      <main className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="serif text-4xl">Pedido confirmado</h1>
        <p className="mt-3">{result.order.number} · {aoa(Number(result.order.total))}</p>
        <p className="mt-2 text-sm text-ink/60">Se o produto for digital, o acesso já está na área de membros.</p>
        <a className="btn-primary mt-6 inline-flex" href="/members">Ir para os meus cursos</a>
      </main>
    );
  }
  if (result?.payment?.referenceCode) {
    return (
      <main className="mx-auto max-w-lg px-6 py-20">
        <h1 className="serif text-4xl">Referência gerada</h1>
        <p className="mt-4 font-mono text-3xl">{result.payment.referenceCode}</p>
        <button className="btn-primary mt-6" onClick={async () => {
          const r = await api('/payments/confirm', { method: 'POST', body: JSON.stringify({ providerRef: result.payment.providerRef }) });
          setResult({ ...result, payment: { ...result.payment, status: 'APPROVED' } });
        }}>Simular pagamento (sandbox)</button>
      </main>
    );
  }
  return (
    <main className="mx-auto grid max-w-5xl gap-10 px-6 py-12 md:grid-cols-2">
      <form onSubmit={pay} className="space-y-4">
        <h1 className="serif text-4xl">Checkout</h1>
        <div><label className="label">Nome</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div><label className="label">Email</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div>
          <label className="label">Pagamento</label>
          <div className="flex gap-2">
            {(['CARD', 'REFERENCE', 'TRANSFER'] as const).map((m) => (
              <button type="button" key={m} onClick={() => setMethod(m)} className={`btn-ghost ${method === m ? 'bg-ink text-cream' : ''}`}>{m}</button>
            ))}
          </div>
        </div>
        {err && <p className="text-clay text-sm">{err}</p>}
        <button className="btn-primary" type="submit">Pagar {quote ? aoa(quote.total) : ''}</button>
        <p className="text-xs text-ink/45">Sandbox: cartão 4242 aprova · token "fail" recusa. Nenhum dado de cartão é gravado.</p>
      </form>
      <aside className="card h-fit p-6">
        <h2 className="serif text-2xl">Resumo</h2>
        {(quote?.cart?.items || []).map((i: any) => (
          <p key={i.id} className="mt-2 text-sm">{i.product.name} · {aoa(Number(i.price) * i.quantity)}</p>
        ))}
        <p className="mt-4 font-medium">Total {quote ? aoa(quote.total) : '—'}</p>
      </aside>
    </main>
  );
}
