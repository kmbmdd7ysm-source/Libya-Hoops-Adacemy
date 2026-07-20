import { afterEach, describe, expect, it, vi } from 'vitest';

describe('remaining critical branches', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('rejects invalid trusted rates instead of restoring a local fallback', async () => {
    const { validateUsdToLydRate } =
      await import('../src/services/commerceSettings.js?trusted-rate');
    for (const value of [0, -1, null, undefined, 'bad', NaN, Infinity, -Infinity]) {
      expect(() => validateUsdToLydRate(value)).toThrow('invalid_exchange_rate');
    }
    expect(validateUsdToLydRate('8.75')).toBe(8.75);
  });

  it('includes development diagnostics for message and non-message errors', async () => {
    vi.stubEnv('DEV', true);
    const { mapError } = await import('../src/utils/errors.js?dev-debug');
    expect(mapError(new Error('provider exploded')).debug).toBe('provider exploded');
    expect(mapError({ code: 'unknown' }).debug).toBe('[object Object]');
  });

  it('uses the mutation id fallback when randomUUID is unavailable', async () => {
    const originalCrypto = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: {} });
    try {
      const { mutationId, normalizeIds } =
        await import('../src/services/sync/protocol.js?fallback-id');
      expect(mutationId()).toMatch(/^m-/);
      expect(normalizeIds()).toEqual([]);
    } finally {
      Object.defineProperty(globalThis, 'crypto', { configurable: true, value: originalCrypto });
    }
  });
});
