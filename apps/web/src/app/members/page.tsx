'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function MembersPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api('/members/enrollments').then(setRows).catch(() => setRows([])); }, []);
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="serif text-4xl">Continuar a assistir</h1>
      <div className="mt-8 space-y-4">
        {rows.map((e) => (
          <Link key={e.id} href={`/members/courses/${e.courseId}`} className="card block p-6">
            <h2 className="serif text-2xl">{e.course?.product?.name}</h2>
            <div className="mt-3 h-2 rounded-full bg-ink/10">
              <div className="h-2 rounded-full bg-gold" style={{ width: `${Number(e.progress)}%` }} />
            </div>
            <p className="mt-2 text-sm">Você concluiu {Number(e.progress).toFixed(0)}%</p>
          </Link>
        ))}
        {!rows.length && <p>Ainda sem cursos. Compre um curso no marketplace.</p>}
      </div>
    </main>
  );
}
