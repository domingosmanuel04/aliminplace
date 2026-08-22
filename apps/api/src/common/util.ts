import slugifyLib from 'slugify';
import { Prisma } from '@prisma/client';

export function slugify(text: string) {
  return slugifyLib(text, { lower: true, strict: true, locale: 'pt' });
}

export function money(n: Prisma.Decimal | number | string): number {
  return Number(n);
}

export function orderNumber(seq: number) {
  return `TR-${String(seq).padStart(6, '0')}`;
}

export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function startOfYear(d = new Date()) {
  return new Date(d.getFullYear(), 0, 1);
}

export function previousPeriod(from: Date, to: Date) {
  const ms = to.getTime() - from.getTime();
  return { from: new Date(from.getTime() - ms), to: from };
}
