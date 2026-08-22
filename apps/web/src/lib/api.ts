const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

export function sessionId() {
  if (typeof window === 'undefined') return 'ssr';
  const k = 'trauner_sid';
  let v = localStorage.getItem(k);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(k, v);
  }
  return v;
}

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const tenant = typeof window !== 'undefined' ? localStorage.getItem('tenantId') : null;
  const res = await fetch(`${API}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(tenant ? { 'x-tenant-id': tenant } : {}),
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Erro de API');
  }
  return res.json();
}

export function aoa(n: number) {
  return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(n || 0);
}

export function setTenant(id: string) {
  localStorage.setItem('tenantId', id);
}
