import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { maybeSingle, single, upsert, getSupabase } = vi.hoisted(() => {
  const maybeSingle = vi.fn();
  const single = vi.fn();
  const select = vi.fn(() => ({ eq: () => ({ maybeSingle }), single }));
  const upsert = vi.fn(() => ({ select }));
  const from = vi.fn(() => ({ select, upsert }));
  const getSupabase = vi.fn(async () => ({ from }));
  return { maybeSingle, single, select, upsert, from, getSupabase };
});
vi.mock('../src/services/supabase', () => ({ getSupabase }));

import * as cloud from '../src/services/sync/cloudState';
import {
  clearPendingCommercePreference,
  readPendingCommercePreference,
  writePendingCommercePreference,
} from '../src/services/commercePreferences';
import {
  clearUserScope,
  createChannel,
  safeRead,
  safeRemove,
  safeWrite,
} from '../src/services/sync/storage';

describe('critical defensive edge branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    maybeSingle.mockResolvedValue({ data: null, error: null });
    single.mockResolvedValue({ data: { ok: true }, error: null });
  });
  afterEach(() => vi.restoreAllMocks());

  it('handles absent, null, and unavailable storage without leaking state', () => {
    expect(safeRead('missing', 7)).toBe(7);
    localStorage.setItem('nullish', 'null');
    expect(safeRead('nullish', 8)).toBe(8);
    expect(safeWrite('ok', { a: 1 })).toBe(true);
    expect(safeRemove('ok')).toBe(true);
    expect(() => clearUserScope(['cart'], null)).not.toThrow();

    vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
      throw new Error('blocked');
    });
    expect(safeRead('blocked', 'fallback')).toBe('fallback');
  });

  it('uses BroadcastChannel when available and rejects malformed/noise storage events', () => {
    const posted = [];
    let delivered;
    const close = vi.fn();
    class FakeBroadcastChannel {
      constructor() {
        this.onmessage = null;
        delivered = (data) => this.onmessage?.({ data });
      }
      postMessage(message) {
        posted.push(message);
      }
      close() {
        close();
      }
    }
    vi.stubGlobal('BroadcastChannel', FakeBroadcastChannel);
    const received = [];
    const channel = createChannel('edges', (message) => received.push(message));
    const own = channel.post('sync', { ok: true });
    expect(posted).toEqual([own]);
    delivered(null);
    delivered({ ...own, messageId: 'remote', originTabId: 'other' });
    window.dispatchEvent(new StorageEvent('storage', { key: 'wrong', newValue: '{}' }));
    window.dispatchEvent(new StorageEvent('storage', { key: '__bc__:edges', newValue: '' }));
    window.dispatchEvent(new StorageEvent('storage', { key: '__bc__:edges', newValue: '{' }));
    expect(received).toHaveLength(1);
    channel.close();
    expect(close).toHaveBeenCalledOnce();
  });

  it('normalizes malformed pending commerce preference payloads and guest operations', () => {
    expect(writePendingCommercePreference(null, {})).toBe(false);
    expect(readPendingCommercePreference(null)).toBeNull();
    expect(clearPendingCommercePreference(null)).toBe(false);

    localStorage.setItem('lha-commerce-preference-pending:user:u', JSON.stringify('bad'));
    expect(readPendingCommercePreference('u')).toBeNull();
    localStorage.setItem(
      'lha-commerce-preference-pending:user:u',
      JSON.stringify({ preferredCurrency: 'EUR', preferredCountry: 'BAD', updatedAt: 'x' }),
    );
    expect(readPendingCommercePreference('u')).toEqual({
      preferredCurrency: 'USD',
      preferredCountry: undefined,
      updatedAt: 0,
    });
    expect(writePendingCommercePreference('u', {})).toBe(true);
  });

  it('covers cloud defaults, null clients, and every error-return branch', async () => {
    await cloud.upsertCloudState('u', {});
    expect(upsert.mock.calls.at(-1)[0]).toMatchObject({
      cart: [],
      wishlist: [],
      compare: [],
      recently_viewed: [],
      preferences: {},
      version: 1,
    });

    await cloud.upsertProfile('u', {});
    expect(upsert.mock.calls.at(-1)[0]).toMatchObject({
      first_name: null,
      last_name: null,
      display_name: null,
      preferred_language: 'en',
      preferred_currency: 'USD',
      preferred_country: 'LY',
      preferred_size: null,
      preferred_colors: [],
      preferred_categories: [],
      marketing_consent: false,
    });

    expect(await cloud.upsertCloudState(null, {})).toBeNull();
    expect(await cloud.upsertProfile(null, {})).toBeNull();
    expect(await cloud.fetchCommercePreferences(null)).toBeNull();
    getSupabase.mockResolvedValueOnce(null);
    expect(await cloud.updateCommercePreferences('u', {})).toBeNull();

    maybeSingle.mockResolvedValueOnce({ data: null, error: new Error('profile read') });
    await expect(cloud.fetchProfile('u')).rejects.toThrow('profile read');
    maybeSingle.mockResolvedValueOnce({ data: null, error: new Error('prefs read') });
    await expect(cloud.fetchCommercePreferences('u')).rejects.toThrow('prefs read');
    single.mockResolvedValueOnce({ data: null, error: new Error('profile write') });
    await expect(cloud.upsertProfile('u', {})).rejects.toThrow('profile write');
    single.mockResolvedValueOnce({ data: null, error: new Error('prefs write') });
    await expect(cloud.updateCommercePreferences('u', {})).rejects.toThrow('prefs write');
  });
});
