import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { normalizeAddress, validateAddress } from '../src/services/account/addressService';
import { createChannel, createTabId, safeRead, clearUserScope } from '../src/services/sync/storage';
import { enqueueMutation, queueRead, replayQueue } from '../src/services/sync/offlineQueue';

describe('final meaningful critical branches', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('covers address normalization and country-specific validation branches', () => {
    expect(
      normalizeAddress({ label: ' <Home> ', company: '', addressLine2: '', phone: '' }),
    ).toMatchObject({ label: 'Home', company: null, address_line_2: null, phone: null });
    expect(
      validateAddress({
        country: 'US',
        firstName: 'A',
        lastName: 'B',
        addressLine1: '1',
        city: 'X',
        region: '',
        postalCode: 'bad',
      }).errors,
    ).toMatchObject({ region: 'required', postalCode: 'invalid' });
    expect(
      validateAddress({
        country: 'CA',
        firstName: 'A',
        lastName: 'B',
        addressLine1: '1',
        city: 'X',
        region: 'ON',
        postalCode: 'bad',
      }).errors.postalCode,
    ).toBe('invalid');
  });

  it('covers storage null/fallback, cleanup, malformed events, bounded seen set and UUID fallback', () => {
    localStorage.setItem('nullish', 'null');
    expect(safeRead('nullish', 7)).toBe(7);
    clearUserScope(['a'], null);
    localStorage.setItem('a:user:u', '1');
    clearUserScope(['a'], 'u');
    expect(localStorage.getItem('a:user:u')).toBeNull();
    const originalCrypto = globalThis.crypto;
    vi.stubGlobal('crypto', {});
    expect(createTabId()).toMatch(/^tab-/);
    vi.stubGlobal('crypto', originalCrypto);
    const received = [];
    const channel = createChannel('bounded', (m) => received.push(m));
    window.dispatchEvent(new StorageEvent('storage', { key: '__bc__:bounded', newValue: '{' }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'other', newValue: '{}' }));
    for (let i = 0; i < 252; i++)
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: '__bc__:bounded',
          newValue: JSON.stringify({ messageId: `m${i}`, originTabId: 'other' }),
        }),
      );
    expect(received).toHaveLength(252);
    channel.close();
  });

  it('covers offline queue legacy, abort, foreign, exhausted, stop-on-error and non-Error failures', async () => {
    expect(enqueueMutation({ type: 'missing-id' })).toEqual([]);
    enqueueMutation({ id: 'legacy', type: 'x' });
    expect(queueRead(null)).toHaveLength(1);
    enqueueMutation('u', { id: 'foreign', userId: 'other' });
    enqueueMutation('u', { id: 'exhausted', attempts: 8 });
    enqueueMutation('u', { id: 'fail' });
    enqueueMutation('u', { id: 'after' });
    const result = await replayQueue(
      'u',
      async (m) => {
        if (m.id === 'fail') throw 'plain failure';
      },
      { stopOnError: true, now: () => Number.MAX_SAFE_INTEGER },
    );
    expect(result.failed).toBe(1);
    expect(queueRead('u').find((m) => m.id === 'fail')).toMatchObject({
      lastError: 'plain failure',
      status: 'pending',
    });
    const aborted = await replayQueue('u', vi.fn(), { signal: { aborted: true } });
    expect(aborted.processed).toBe(0);
    expect(await replayQueue(null, vi.fn())).toEqual({ processed: 0, failed: 0, remaining: 0 });
  });
});
