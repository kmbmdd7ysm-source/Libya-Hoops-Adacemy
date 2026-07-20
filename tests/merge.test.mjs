import { describe, expect, it } from 'vitest';
import { mergeCart, mergeIdLists, mergeRecent } from '../src/services/sync/merge.js';

describe('merge facade', () => {
  it('merges exact variant keys and caps stock', () => {
    const result = mergeCart(
      [{ id: 'product:1', key: 'product:1:black-m', quantity: 2, maxStock: 3 }],
      [
        { id: 'product:1', key: 'product:1:black-m', quantity: 2, maxStock: 3 },
        { id: 'product:2', key: 'product:2', quantity: 1 },
      ],
    );
    expect(result.find((item) => item.key === 'product:1:black-m').quantity).toBe(3);
    expect(result).toHaveLength(2);
  });

  it('deduplicates id lists and keeps the newest record', () => {
    const result = mergeIdLists(
      [{ id: 'a', updatedAt: '2026-01-02' }],
      [
        { id: 'a', updatedAt: '2026-01-01' },
        { id: 'b', updatedAt: '2026-01-03' },
      ],
      2,
    );
    expect(result.map((item) => item.id)).toEqual(['b', 'a']);
  });

  it('caps recently viewed through the public merge facade', () => {
    const now = new Date().toISOString();
    expect(
      mergeRecent(
        [
          { id: 'a', updatedAt: now },
          { id: 'b', updatedAt: now },
        ],
        [
          { id: 'b', updatedAt: now },
          { id: 'c', updatedAt: now },
        ],
      ).map((item) => item.id),
    ).toEqual(['b', 'c', 'a']);
  });
});
