import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockClient = { from: vi.fn(), rpc: vi.fn() };

vi.mock('../src/services/supabase', () => ({
  getSupabase: vi.fn(async () => mockClient),
}));

import { getSupabase } from '../src/services/supabase';
import {
  deleteAddress,
  listAddresses,
  normalizeAddress,
  saveAddress,
  setDefaultAddress,
  validateAddress,
} from '../src/services/account/addressService';

const validAddress = {
  firstName: ' A ',
  lastName: 'B',
  addressLine1: '1 Main St',
  city: 'New York',
  region: 'NY',
  postalCode: '10001',
  country: 'us',
};

function listQuery(result = { data: [], error: null }, withAbort = false) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    order: vi.fn(() => query),
    then: (resolve) => resolve(result),
  };
  if (withAbort) query.abortSignal = vi.fn(() => query);
  return query;
}

function mutationQuery(result) {
  const single = vi.fn(async () => result);
  const select = vi.fn(() => ({ single }));
  const query = { eq: vi.fn(() => query), select };
  return { query, select, single };
}

describe('address service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSupabase.mockResolvedValue(mockClient);
  });

  it('normalizes whitespace, Unicode, unsafe brackets, optional fields and lengths', () => {
    const value = normalizeAddress({
      label: '  منزل <رئيسي>  ',
      firstName: ` أحمد ${'x'.repeat(90)} `,
      lastName: ' التركي ',
      company: '   ',
      addressLine1: ' شارع   النصر ',
      addressLine2: '',
      city: ' طرابلس ',
      region: '',
      postalCode: '',
      country: 'ly',
      phone: '',
      isDefault: 1,
    });
    expect(value.label).toBe('منزل رئيسي');
    expect(value.first_name.length).toBe(80);
    expect(value.address_line_1).toBe('شارع النصر');
    expect(value.company).toBeNull();
    expect(value.address_line_2).toBeNull();
    expect(value.phone).toBeNull();
    expect(value.country).toBe('LY');
    expect(value.is_default).toBe(true);
  });

  it('validates required, country, region, postal and country-specific postal formats', () => {
    const empty = validateAddress({});
    expect(empty.valid).toBe(false);
    expect(empty.errors).toMatchObject({
      firstName: 'required',
      lastName: 'required',
      addressLine1: 'required',
      city: 'required',
    });
    expect(validateAddress({ ...validAddress, region: '' }).errors.region).toBe('required');
    expect(validateAddress({ ...validAddress, postalCode: '' }).errors.postalCode).toBe('required');
    expect(validateAddress({ ...validAddress, postalCode: 'bad' }).errors.postalCode).toBe(
      'invalid',
    );
    expect(
      validateAddress({ ...validAddress, country: 'CA', region: 'ON', postalCode: 'bad' }).errors
        .postalCode,
    ).toBe('invalid');
    expect(
      validateAddress({ ...validAddress, country: 'CA', region: 'ON', postalCode: 'K1A 0B1' })
        .valid,
    ).toBe(true);
    expect(
      validateAddress({ ...validAddress, country: 'LY', region: '', postalCode: '' }).valid,
    ).toBe(true);
  });

  it('fails when the provider is unavailable', async () => {
    getSupabase.mockResolvedValueOnce(null);
    await expect(listAddresses('user-1')).rejects.toThrow('Supabase is not configured');
  });

  it('lists addresses, supports cancellation, and maps null data to an empty list', async () => {
    const signal = new AbortController().signal;
    const query = listQuery({ data: [{ id: 'a' }], error: null }, true);
    mockClient.from.mockReturnValue(query);
    await expect(listAddresses('user-1', { signal })).resolves.toEqual([{ id: 'a' }]);
    expect(query.abortSignal).toHaveBeenCalledWith(signal);

    mockClient.from.mockReturnValue(listQuery({ data: null, error: null }));
    await expect(listAddresses('user-1', { signal })).resolves.toEqual([]);
  });

  it('propagates list provider, authorization, network and abort errors', async () => {
    for (const error of [
      Object.assign(new Error('denied'), { code: '42501' }),
      new TypeError('network'),
      new DOMException('Aborted', 'AbortError'),
    ]) {
      mockClient.from.mockReturnValue(listQuery({ data: null, error }));
      await expect(listAddresses('user-1')).rejects.toBe(error);
    }
  });

  it('rejects invalid addresses before a provider request', async () => {
    await expect(saveAddress('user-1', {})).rejects.toMatchObject({
      code: 'VALIDATION',
      fields: expect.any(Object),
    });
    expect(mockClient.from).not.toHaveBeenCalled();
  });

  it('inserts and updates an owned non-default address', async () => {
    let m = mutationQuery({ data: { id: 'new' }, error: null });
    mockClient.from.mockReturnValue({ insert: vi.fn(() => ({ select: m.select })) });
    await expect(saveAddress('user-1', validAddress)).resolves.toEqual({ id: 'new' });

    m = mutationQuery({ data: { id: 'existing' }, error: null });
    const update = vi.fn(() => m.query);
    mockClient.from.mockReturnValue({ update });
    await expect(saveAddress('user-1', validAddress, 'existing')).resolves.toEqual({
      id: 'existing',
    });
    expect(m.query.eq).toHaveBeenCalledWith('id', 'existing');
    expect(m.query.eq).toHaveBeenCalledWith('user_id', 'user-1');
  });

  it('propagates insert and update provider errors with or without messages', async () => {
    for (const [id, error] of [
      [undefined, new Error('insert failed')],
      ['a', { code: 'provider_failure' }],
    ]) {
      const m = mutationQuery({ data: null, error });
      mockClient.from.mockReturnValue(
        id ? { update: vi.fn(() => m.query) } : { insert: vi.fn(() => ({ select: m.select })) },
      );
      await expect(saveAddress('user-1', validAddress, id)).rejects.toBe(error);
    }
  });

  it('uses atomic default RPC for create and edit, then returns the refreshed single-default list', async () => {
    mockClient.rpc.mockResolvedValue({ error: null });
    mockClient.from.mockReturnValue(
      listQuery({ data: [{ id: 'd', is_default: true }], error: null }),
    );
    await expect(
      saveAddress('user-1', { ...validAddress, isDefault: true }, 'd'),
    ).resolves.toHaveLength(1);
    expect(mockClient.rpc).toHaveBeenCalledWith('set_default_address', {
      p_address_id: 'd',
      p_address: expect.objectContaining({ is_default: true }),
    });
  });

  it('propagates both default-address RPC failure paths', async () => {
    const first = new Error('default create failed');
    mockClient.rpc.mockResolvedValueOnce({ error: first });
    await expect(saveAddress('user-1', { ...validAddress, isDefault: true })).rejects.toBe(first);
    const second = { code: 'rpc_failed' };
    mockClient.rpc.mockResolvedValueOnce({ error: second });
    await expect(setDefaultAddress('user-1', 'a')).rejects.toBe(second);
  });

  it('deletes only an owned address and propagates delete failures', async () => {
    const query = { eq: vi.fn(() => query), then: (resolve) => resolve({ error: null }) };
    mockClient.from.mockReturnValue({ delete: vi.fn(() => query) });
    await expect(deleteAddress('user-1', 'a')).resolves.toBeUndefined();
    expect(query.eq).toHaveBeenCalledWith('user_id', 'user-1');

    const error = new Error('delete failed');
    const failed = { eq: vi.fn(() => failed), then: (resolve) => resolve({ error }) };
    mockClient.from.mockReturnValue({ delete: vi.fn(() => failed) });
    await expect(deleteAddress('user-1', 'missing')).rejects.toBe(error);
  });

  it('sets default successfully and returns refreshed addresses', async () => {
    mockClient.rpc.mockResolvedValue({ error: null });
    mockClient.from.mockReturnValue(
      listQuery({ data: [{ id: 'a', is_default: true }], error: null }),
    );
    await expect(setDefaultAddress('user-1', 'a')).resolves.toEqual([
      { id: 'a', is_default: true },
    ]);
  });
});
