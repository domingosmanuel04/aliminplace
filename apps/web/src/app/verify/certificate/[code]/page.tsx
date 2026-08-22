'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function VerifyPage({ params }: { params: Promise<{ code: string }> }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    params.then(async (p) => {
      try { setData(await api(`/verify/certificate/${p.code}`)); } catch (e: any) { setErr(e.message); }
    });
  }, [params]);
  return (
    <main className="mx-auto max-w-lg px-6 py-20 text-center">
      <h1 className="serif text-4xl">Verificar certificado</h1>
      {data && <p className="mt-6">{data.student} concluiu {data.course} em {new Date(data.issuedAt).toLocaleDateString('pt-PT')}</p>}
      {err && <p className="mt-6 text-clay">{err}</p>}
    </main>
  );
}
