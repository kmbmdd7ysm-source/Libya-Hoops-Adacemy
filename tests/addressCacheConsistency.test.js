import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockClient = { from: vi.fn() };
vi.mock('../src/services/supabase', () => ({
  getSupabase: vi.fn(async () => mockClient),
}));
import { getSupabase } from '../src/services/supabase';
import { listAddresses } from '../src/services/account/addressService';

const userId = '00000000-0000-4000-8000-000000000001';
function listQuery(response) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    order: vi.fn(() => query),
    then: (resolve) => resolve(response),
  };
  return query;
}
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  getSupabase.mockResolvedValue(mockClient);
});

describe('address cloud/cache consistency', () => {
  it('does not resurrect an address deleted on another device after a successful empty cloud response', async () => {
    localStorage.setItem(`lha-addresses-v2:${userId}`, JSON.stringify([{ id: 'stale' }]));
    mockClient.from.mockReturnValue(listQuery({ data: [], error: null }));
    await expect(listAddresses(userId)).resolves.toEqual([]);
    expect(JSON.parse(localStorage.getItem(`lha-addresses-v2:${userId}`))).toEqual([]);
  });

  it('does not silently show stale cached addresses when an online cloud query is denied', async () => {
    localStorage.setItem(`lha-addresses-v2:${userId}`, JSON.stringify([{ id: 'stale' }]));
    const error = Object.assign(new Error('denied'), { code: '42501' });
    mockClient.from.mockReturnValue(listQuery({ data: null, error }));
    await expect(listAddresses(userId)).rejects.toBe(error);
  });
});
