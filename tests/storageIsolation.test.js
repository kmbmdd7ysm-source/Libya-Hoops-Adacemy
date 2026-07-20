import { beforeEach, describe, expect, it } from 'vitest';
import { clearUserScope, readScoped, scopeKey, writeScoped } from '../src/services/sync/storage';

describe('scoped browser persistence', () => {
  beforeEach(() => localStorage.clear());

  it('uses independent guest and per-user keys', () => {
    expect(scopeKey('cart', null)).toBe('cart:guest');
    expect(scopeKey('cart', 'a')).toBe('cart:user:a');
  });

  it('prevents Account A data from appearing in guest or Account B state', () => {
    writeScoped('cart', 'a', [{ id: 'private-a' }]);
    writeScoped('cart', 'b', [{ id: 'private-b' }]);
    writeScoped('cart', null, [{ id: 'guest' }]);

    expect(readScoped('cart', 'a', [])).toEqual([{ id: 'private-a' }]);
    expect(readScoped('cart', 'b', [])).toEqual([{ id: 'private-b' }]);
    expect(readScoped('cart', null, [])).toEqual([{ id: 'guest' }]);
  });

  it('clears only the requested authenticated scope', () => {
    writeScoped('cart', 'a', [1]);
    writeScoped('wishlist', 'a', [2]);
    writeScoped('cart', 'b', [3]);
    writeScoped('cart', null, [4]);

    clearUserScope(['cart', 'wishlist'], 'a');

    expect(readScoped('cart', 'a', [])).toEqual([]);
    expect(readScoped('wishlist', 'a', [])).toEqual([]);
    expect(readScoped('cart', 'b', [])).toEqual([3]);
    expect(readScoped('cart', null, [])).toEqual([4]);
  });
});
