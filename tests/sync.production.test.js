import { describe, expect, it, vi } from 'vitest';
import {
  mergeCart,
  mergeIdLists,
  mergeRecent,
  reconcileState,
  MAX_COMPARE,
} from '../src/services/sync/protocol';
import { enqueueMutation, queueRead, replayQueue } from '../src/services/sync/offlineQueue';

describe('production sync and conflict behavior', () => {
  it('merges exact variants, caps stock, and preserves unique variants', () => {
    const catalog = new Map([['p1', { id: 'p1', price: 12, stock: 3 }]]);
    const result = mergeCart(
      [
        { key: 'p1:black:m', id: 'p1', quantity: 2, price: 10 },
        { key: 'p1:white:m', id: 'p1', quantity: 1, price: 12 },
      ],
      [{ key: 'p1:black:m', id: 'p1', quantity: 2, price: 12 }],
      catalog,
    );
    expect(result.items).toHaveLength(2);
    expect(result.items.find((x) => x.key === 'p1:black:m').quantity).toBe(3);
    expect(result.notices.some((n) => n.code === 'price_changed')).toBe(true);
  });

  it('trims comparison by most recent timestamp and deduplicates', () => {
    const local = Array.from({ length: 5 }, (_, i) => ({
      id: `p${i}`,
      updatedAt: new Date(1000 + i).toISOString(),
    }));
    const result = mergeIdLists(
      local,
      [{ id: 'p4', updatedAt: new Date(9999).toISOString() }],
      MAX_COMPARE,
    );
    expect(result).toHaveLength(4);
    expect(result[0].id).toBe('p4');
    expect(new Set(result.map((x) => x.id)).size).toBe(4);
  });

  it('rejects stale versions by producing a strictly newer reconciled version', () => {
    const result = reconcileState({ cart: [], version: 2 }, { cart: [], version: 8 });
    expect(result.state.version).toBe(9);
  });

  it('orders and retains recent history correctly', () => {
    const now = Date.now();
    const result = mergeRecent(
      [{ id: 'a', viewedAt: new Date(now - 1000).toISOString() }],
      [
        { id: 'a', viewedAt: new Date(now - 500).toISOString() },
        { id: 'b', viewedAt: new Date(now - 100).toISOString() },
      ],
      now,
    );
    expect(result.map((x) => x.id)).toEqual(['b', 'a']);
  });

  it('deduplicates mutations and never replays account A under account B', async () => {
    const mutation = { id: 'm1', entity: 'currency', operation: 'update' };
    enqueueMutation('account-a', mutation);
    enqueueMutation('account-a', mutation);
    expect(queueRead('account-a')).toHaveLength(1);
    const handler = vi.fn();
    await replayQueue('account-b', handler);
    expect(handler).not.toHaveBeenCalled();
  });

  it('retains failed mutations and removes only confirmed successes', async () => {
    enqueueMutation('account-c', { id: 'm2', entity: 'currency', operation: 'update' });
    await replayQueue(
      'account-c',
      async () => {
        throw new Error('offline');
      },
      { now: () => Date.now() + 1000 },
    );
    expect(queueRead('account-c')).toHaveLength(1);
    const queued = queueRead('account-c')[0];
    expect(queued.attempts).toBe(1);
    await replayQueue('account-c', async () => {}, { now: () => queued.nextRetryAt + 1 });
    expect(queueRead('account-c')).toHaveLength(0);
  });
});
