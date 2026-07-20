import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Money,
  convertPrice,
  formatMoney,
  getAccessibleMoneyLabel,
  sumMoney,
} from '../src/services/money';
import {
  sanitizePayload,
  trackEvent,
  trackPage,
  revokeAnalyticsConsent,
} from '../src/utils/analytics';
import { mapError, errorText } from '../src/utils/errors';
import {
  detectWallets,
  isPaymentsConfigured,
  createCheckoutSession,
  paymentProviderName,
} from '../src/utils/payments';
import { onPwaEvent, promptInstall, applyPwaUpdate, isStandalone } from '../src/utils/registerPwa';
import {
  mergeCart,
  mergeIdLists,
  mergeRecent,
  normalizeIds,
  mutationId,
  reconcileState,
} from '../src/services/sync/protocol';
import {
  enqueueMutation,
  queueRead,
  removeMutation,
  updateMutation,
  replayQueue,
  backoffMs,
} from '../src/services/sync/offlineQueue';

describe('critical money edge cases', () => {
  it('validates construction, conversion, arithmetic and immutability', () => {
    const usd = Money.fromMajor('1.005', 'USD');
    expect(usd.minorUnits).toBe(100);
    expect(Object.isFrozen(usd)).toBe(true);
    expect(usd.multiply(0).toMajor()).toBe(0);
    expect(usd.multiply(-2).toMajor()).toBe(-2);
    expect(usd.percent(50).toMajor()).toBe(0.5);
    expect(usd.convert('USD')).toBe(usd);
    expect(convertPrice(90, 'LYD', 'USD', 9)).toBe(10);
    expect(() => new Money(1.2, 'USD')).toThrow(TypeError);
    expect(() => new Money(1, 'usd')).toThrow(TypeError);
    expect(() => Money.fromMajor(Number.MAX_VALUE, 'USD')).toThrow(RangeError);
    expect(() => usd.multiply(NaN)).toThrow(TypeError);
    expect(() => usd.percent(Infinity)).toThrow(TypeError);
    expect(() => sumMoney([Money.fromMajor(1, 'LYD')], 'USD')).toThrow(TypeError);
  });

  it('formats inaccessible and accessible values in both languages', () => {
    expect(formatMoney(1, 'BAD', 'ar')).toBe('السعر غير متاح');
    expect(getAccessibleMoneyLabel(NaN, 'USD', 'ar')).toBe('السعر غير متاح');
    expect(getAccessibleMoneyLabel(12.5, 'LYD', 'en')).toContain('Libyan dinars');
    expect(getAccessibleMoneyLabel(12.5, 'USD', 'ar')).toContain('دولار أمريكي');
  });
});

describe('sync protocol edge cases', () => {
  it('normalizes IDs, rejects malformed cart entries, and reconciles aliases', () => {
    const normalized = normalizeIds(['a', null, { id: 'b' }, {}]);
    expect(normalized.map((x) => x.id)).toEqual(['a', 'b']);
    expect(mutationId()).toBeTruthy();
    const catalog = new Map([['ok', { price: 20, stock: 0 }]]);
    const cart = mergeCart(
      [
        null,
        { id: 'missing', key: 'missing:x', quantity: 1 },
        { id: 'ok', key: 'ok:x', quantity: 'bad', price: 10 },
      ],
      [],
      catalog,
    );
    expect(cart.items[0].quantity).toBe(1);
    expect(cart.items[0].maxStock).toBe(1);
    expect(cart.notices.map((x) => x.code)).toEqual(['removed_product', 'price_changed']);
    const state = reconcileState(
      {},
      { recently_viewed: [{ id: 'r', viewedAt: new Date().toISOString() }] },
    );
    expect(state.state.recentlyViewed[0].id).toBe('r');
  });

  it('handles equal, invalid and expired timestamps deterministically', () => {
    const same = new Date(1000).toISOString();
    expect(
      mergeIdLists([{ id: 'a', updatedAt: same }], [{ id: 'a', updatedAt: same }]),
    ).toHaveLength(1);
    expect(mergeIdLists([{ id: 'x', updatedAt: 'bad' }], [])).toHaveLength(1);
    expect(
      mergeRecent([{ id: 'old', viewedAt: new Date(0).toISOString() }], [], Date.now()),
    ).toEqual([]);
  });
});

describe('offline queue control flow', () => {
  beforeEach(() => localStorage.clear());

  it('supports legacy operations, updates, removal, abort and stop-on-error', async () => {
    enqueueMutation({ id: 'legacy', type: 'x' });
    expect(queueRead(null)).toHaveLength(1);
    updateMutation(null, 'legacy', { status: 'changed' });
    expect(queueRead(null)[0].status).toBe('changed');
    removeMutation('legacy');
    expect(queueRead(null)).toEqual([]);

    enqueueMutation('u', { id: 'a' });
    enqueueMutation('u', { id: 'b' });
    const result = await replayQueue('u', vi.fn(), { signal: { aborted: true } });
    expect(result.processed).toBe(0);
    const stopped = await replayQueue(
      'u',
      async () => {
        throw new Error('no');
      },
      { stopOnError: true },
    );
    expect(stopped.failed).toBe(1);
    expect(backoffMs('bad')).toBe(500);
    expect(await replayQueue(null, vi.fn())).toEqual({ processed: 0, failed: 0, remaining: 0 });
  });
});

describe('privacy utilities and safe errors', () => {
  it('sanitizes sensitive values, arrays, long strings and unsupported objects', () => {
    const clean = sanitizePayload({
      password: 'secret',
      addressLine: 'hidden',
      query: 'mail x@y.com phone +1 212 555 1212',
      count: 2,
      enabled: true,
      values: ['a@b.com', 'ok'],
      object: { secret: true },
      nil: null,
      long: 'x'.repeat(150),
    });
    expect(clean.password).toBeUndefined();
    expect(clean.query).toContain('[email]');
    expect(clean.query).toContain('[phone]');
    expect(clean.long).toHaveLength(100);
    expect(clean.object).toBeUndefined();
    expect(clean.values[0]).toBe('[email]');
  });

  it('maps authentication/session/offline/generic errors without enumeration', () => {
    expect(mapError(new Error('Invalid credentials')).code).toBe('auth_invalid');
    expect(errorText(new Error('Email not confirmed'), 'ar')).toContain('تأكيد');
    expect(mapError(new Error('JWT expired')).code).toBe('session_expired');
    const online = navigator.onLine;
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    expect(mapError(new Error('network')).code).toBe('offline');
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: online });
    expect(errorText(new Error('unknown'), 'xx')).toBe('Something went wrong. Please try again.');
  });

  it('suppresses analytics without consent and safely revokes providers', () => {
    window.gtag = vi.fn();
    window.clarity = vi.fn();
    trackEvent('search', { query: 'a@b.com' });
    trackPage('/account');
    expect(window.gtag).not.toHaveBeenCalled();
    revokeAnalyticsConsent();
    expect(window.clarity).toHaveBeenCalledWith('consent', false);
  });
});

describe('payment and PWA safe defaults', () => {
  it('keeps real payments disabled without configuration', async () => {
    expect(isPaymentsConfigured()).toBe(false);
    expect(paymentProviderName()).toBe('');
    expect(await detectWallets()).toEqual([]);
    await expect(createCheckoutSession({ cart: [] })).rejects.toMatchObject({
      code: 'not_configured',
    });
  });

  it('handles absent prompts, update registrations, listeners and standalone checks', async () => {
    const listener = vi.fn();
    const unsubscribe = onPwaEvent(listener);
    expect(await promptInstall()).toBe(false);
    expect(() => applyPwaUpdate()).not.toThrow();
    globalThis.matchMedia = vi.fn(() => ({ matches: true }));
    expect(isStandalone()).toBe(true);
    unsubscribe();
  });
});
