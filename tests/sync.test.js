import { describe, it, expect, beforeEach } from 'vitest';
import {
  mergeCart,
  mergeIdLists,
  mergeRecent,
  reconcileState,
  mutationId,
  MAX_COMPARE,
  MAX_RECENT,
} from '../src/services/sync/protocol';
import { scopeKey, safeRead, safeWrite, clearUserScope } from '../src/services/sync/storage';
import {
  enqueueMutation,
  queueRead,
  removeMutation,
  backoffMs,
} from '../src/services/sync/offlineQueue';
describe('privacy-scoped storage', () => {
  beforeEach(() => localStorage.clear());
  it('isolates guest and users', () => {
    safeWrite(scopeKey('lha-cart', null), ['guest']);
    safeWrite(scopeKey('lha-cart', 'a'), ['a']);
    safeWrite(scopeKey('lha-cart', 'b'), ['b']);
    expect(safeRead(scopeKey('lha-cart', null), [])).toEqual(['guest']);
    expect(safeRead(scopeKey('lha-cart', 'b'), [])).toEqual(['b']);
    clearUserScope(['lha-cart'], 'a');
    expect(safeRead(scopeKey('lha-cart', 'a'), [])).toEqual([]);
    expect(safeRead(scopeKey('lha-cart', null), [])).toEqual(['guest']);
  });
});
describe('merge protocol', () => {
  it('merges duplicate variants and caps stock', () => {
    const r = mergeCart(
      [{ id: 'p', key: 'product:p:black-m', quantity: 4, maxStock: 5, price: 10 }],
      [{ id: 'p', key: 'product:p:black-m', quantity: 4, maxStock: 5, price: 10 }],
    );
    expect(r.items[0].quantity).toBe(5);
  });
  it('detects price changes and removed products', () => {
    const c = new Map([['p', { price: 20, stock: 2 }]]);
    const r = mergeCart(
      [
        { id: 'p', key: 'k', price: 10, quantity: 1 },
        { id: 'gone', key: 'g', price: 1, quantity: 1 },
      ],
      [],
      c,
    );
    expect(r.items[0].price).toBe(20);
    expect(r.notices.map((x) => x.code)).toEqual(
      expect.arrayContaining(['price_changed', 'removed_product']),
    );
  });
  it('deduplicates and trims comparison', () => {
    const a = Array.from({ length: 6 }, (_, i) => ({
      id: String(i),
      updatedAt: new Date(1000 + i).toISOString(),
    }));
    expect(mergeIdLists(a, [], MAX_COMPARE)).toHaveLength(4);
  });
  it('orders and retains recent history', () => {
    const now = Date.now();
    const r = mergeRecent(
      [
        { id: 'old', viewedAt: new Date(now - 1000 * 60 * 60 * 24 * 100).toISOString() },
        { id: 'new', viewedAt: new Date(now).toISOString() },
      ],
      [],
      now,
    );
    expect(r.map((x) => x.id)).toEqual(['new']);
    expect(r.length).toBeLessThanOrEqual(MAX_RECENT);
  });
  it('increments version on reconciliation', () => {
    expect(reconcileState({ version: 3 }, { version: 6 }).state.version).toBe(7);
  });
  it('creates unique mutation ids', () => expect(mutationId()).not.toBe(mutationId()));
});
describe('offline queue', () => {
  beforeEach(() => localStorage.clear());
  it('deduplicates mutation ids', () => {
    enqueueMutation({ id: '1' });
    enqueueMutation({ id: '1' });
    expect(queueRead()).toHaveLength(1);
    removeMutation('1');
    expect(queueRead()).toHaveLength(0);
  });
  it('uses bounded exponential backoff', () => {
    expect(backoffMs(0)).toBe(500);
    expect(backoffMs(20)).toBe(30000);
  });
});
