import { beforeEach, describe, expect, it, vi } from 'vitest';

const maybeSingle = vi.fn();
const single = vi.fn();
const select = vi.fn(() => ({ eq: () => ({ maybeSingle }), single }));
const upsert = vi.fn(() => ({ select }));
const from = vi.fn(() => ({ select, upsert }));
const getSupabase = vi.fn(async () => ({ from }));
vi.mock('../src/services/supabase', () => ({ getSupabase }));

const service = await import('../src/services/sync/cloudState');

describe('cloud state services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    maybeSingle.mockResolvedValue({ data: null, error: null });
    single.mockResolvedValue({ data: { ok: true }, error: null });
  });

  it('fetches user state scoped to the authenticated user', async () => {
    await service.fetchCloudState('user-a');
    expect(from).toHaveBeenCalledWith('user_state');
  });

  it('writes canonical state with an explicit version', async () => {
    await service.upsertCloudState('user-a', { cart: [], version: 7 });
    const payload = upsert.mock.calls[0][0];
    expect(payload.user_id).toBe('user-a');
    expect(payload.version).toBe(7);
  });

  it('writes only allowlisted profile preference fields', async () => {
    await service.updateCommercePreferences('user-a', {
      preferredCurrency: 'LYD',
      preferredCountry: 'US',
      admin: true,
    });
    const payload = upsert.mock.calls[0][0];
    expect(payload).toMatchObject({
      id: 'user-a',
      preferred_currency: 'LYD',
      preferred_country: 'US',
    });
    expect(payload).not.toHaveProperty('admin');
  });

  it('does not make requests without a user id', async () => {
    expect(await service.fetchCloudState(null)).toBeNull();
    expect(await service.updateCommercePreferences(null, {})).toBeNull();
    expect(from).not.toHaveBeenCalled();
  });
  it('covers profile and commerce preference read/write paths', async () => {
    maybeSingle.mockResolvedValue({ data: { id: 'user-a' }, error: null });
    expect(await service.fetchProfile('user-a')).toEqual({ id: 'user-a' });
    expect(await service.fetchCommercePreferences('user-a')).toEqual({ id: 'user-a' });

    await service.upsertProfile('user-a', {
      firstName: 'A',
      last_name: 'B',
      preferredLanguage: 'ar',
      preferredCurrency: 'LYD',
      preferredCountry: 'LY',
      preferredColors: ['black'],
      marketingConsent: 1,
    });
    expect(upsert.mock.calls.at(-1)[0]).toMatchObject({
      id: 'user-a',
      first_name: 'A',
      last_name: 'B',
      preferred_language: 'ar',
      preferred_currency: 'LYD',
      preferred_country: 'LY',
      preferred_colors: ['black'],
      marketing_consent: true,
    });
  });

  it('propagates cloud read and write errors', async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: new Error('read failed') });
    await expect(service.fetchCloudState('user-a')).rejects.toThrow('read failed');
    single.mockResolvedValueOnce({ data: null, error: new Error('write failed') });
    await expect(service.upsertCloudState('user-a', {})).rejects.toThrow('write failed');
  });

  it('returns null when the cloud client is unavailable', async () => {
    getSupabase.mockResolvedValueOnce(null);
    expect(await service.fetchProfile('user-a')).toBeNull();
  });
});
