'use client';
import Link from 'next/link';
import { useState } from 'react';
import { api, setTenant } from '@/lib/api';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
      window.location.href = '/onboarding';
    } catch (err: any) {
      setError(err.message);
    }
  }
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Link href="/" className="serif mb-8 text-3xl">Trauner</Link>
      <h1 className="serif text-4xl">Criar conta</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div><label className="label">Nome</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div><label className="label">Email</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div><label className="label">Palavra-passe</label><input className="input" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        {error && <p className="text-sm text-clay">{error}</p>}
        <button className="btn-primary w-full" type="submit">Começar</button>
      </form>
    </main>
  );
}
