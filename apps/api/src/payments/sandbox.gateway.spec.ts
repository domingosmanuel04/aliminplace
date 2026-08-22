import { describe, expect, it } from 'vitest';
import { slugify } from '../common/util';
import { SandboxGateway } from './sandbox.gateway';

describe('slugify', () => {
  it('normalizes names', () => {
    expect(slugify('Curso de Musculação')).toMatch(/curso-de-muscul/);
  });
});

describe('SandboxGateway', () => {
  const g = new SandboxGateway();
  it('approves valid cards', async () => {
    const r = await g.charge({ amount: 1000, currency: 'AOA', method: 'CARD', token: '4242424242424242' });
    expect(r.status).toBe('APPROVED');
    expect(r.last4).toBe('4242');
  });
  it('declines fail tokens', async () => {
    const r = await g.charge({ amount: 1000, currency: 'AOA', method: 'CARD', token: 'fail' });
    expect(r.status).toBe('FAILED');
  });
  it('creates payment references', async () => {
    const r = await g.charge({ amount: 1000, currency: 'AOA', method: 'REFERENCE' });
    expect(r.status).toBe('PENDING');
    expect(r.referenceCode).toHaveLength(9);
  });
});
