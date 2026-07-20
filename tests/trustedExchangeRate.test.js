import { beforeEach, describe, expect, it, vi } from 'vitest';

const rpc = vi.fn();
vi.mock('../src/services/supabase', () => ({
  getSupabase: vi.fn(async () => ({ rpc })),
}));

import { fetchUsdToLydRate, validateUsdToLydRate } from '../src/services/commerceSettings';
import { resolveShipping } from '../src/config/shipping';
import { events } from '../src/data/events';

beforeEach(() => rpc.mockReset());

describe('backend-authoritative exchange rate', () => {
  it('retrieves and validates the approved backend value', async () => {
    rpc.mockResolvedValue({ data: { usd_to_lyd_rate: 8.5 }, error: null });
    await expect(fetchUsdToLydRate()).resolves.toBe(8.5);
    expect(rpc).toHaveBeenCalledWith('get_public_commerce_settings');
  });

  it.each([0, -1, null, undefined, 'not-a-number', NaN, Infinity, -Infinity])(
    'rejects unsafe rate %s',
    (value) => expect(() => validateUsdToLydRate(value)).toThrow('invalid_exchange_rate'),
  );

  it('does not silently replace a failed backend response with a local rate', async () => {
    rpc.mockResolvedValue({ data: null, error: new Error('backend unavailable') });
    await expect(fetchUsdToLydRate()).rejects.toThrow('backend unavailable');
  });

  it('changes new shipping calculations when the approved rate changes', () => {
    expect(
      resolveShipping('LY', { hasPhysical: true, subtotalUsd: 40, usdToLydRate: 8 })
        .canonicalAmount,
    ).toBe(2.5);
    expect(
      resolveShipping('LY', { hasPhysical: true, subtotalUsd: 40, usdToLydRate: 10 })
        .canonicalAmount,
    ).toBe(2);
  });
});

describe('event catalog consistency', () => {
  it('keeps ev03 explicitly full and unavailable rather than registerable free', () => {
    const event = events.find(({ id }) => id === 'ev03');
    expect(event).toMatchObject({ price: 0, status: 'full', remaining: 0, capacity: 50 });
  });
});
