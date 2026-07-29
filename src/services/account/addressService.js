import { getSupabase } from '../supabase';
import { getAddressRequirements, normalizeCountryCode } from '../../data/countries';
const clean = (v) =>
  String(v ?? '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
export function normalizeAddress(input) {
  return {
    label: clean(input.label).slice(0, 40) || 'Home',
    first_name: clean(input.firstName).slice(0, 80),
    last_name: clean(input.lastName).slice(0, 80),
    company: clean(input.company).slice(0, 120) || null,
    address_line_1: clean(input.addressLine1).slice(0, 180),
    address_line_2: clean(input.addressLine2).slice(0, 180) || null,
    city: clean(input.city).slice(0, 100),
    region: clean(input.region).slice(0, 100),
    postal_code: clean(input.postalCode).slice(0, 24),
    country: normalizeCountryCode(clean(input.country)),
    phone: clean(input.phone).slice(0, 30) || null,
    is_default: Boolean(input.isDefault),
  };
}
export function validateAddress(input) {
  const a = normalizeAddress(input),
    errors = {};
  for (const [k, label] of [
    ['first_name', 'firstName'],
    ['last_name', 'lastName'],
    ['address_line_1', 'addressLine1'],
    ['city', 'city'],
    ['country', 'country'],
  ])
    if (!a[k]) errors[label] = 'required';
  const requirements = getAddressRequirements(a.country);
  if (!requirements) errors.country = 'invalid';
  if (requirements?.regionRequired && !a.region) errors.region = 'required';
  if (requirements?.postalCodeRequired && !a.postal_code) errors.postalCode = 'required';
  if (a.country === 'US' && a.postal_code && !/^\d{5}(-\d{4})?$/.test(a.postal_code))
    errors.postalCode = 'invalid';
  if (a.country === 'CA' && a.postal_code && !/^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/i.test(a.postal_code))
    errors.postalCode = 'invalid';
  return { value: a, errors, valid: Object.keys(errors).length === 0 };
}
async function client() {
  const s = await getSupabase();
  if (!s) throw Error('Supabase is not configured');
  return s;
}
export async function listAddresses(userId, options = {}) {
  const s = await client();
  let query = s
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('updated_at', { ascending: false });
  const signal = options.signal;
  if (signal && typeof query.abortSignal === 'function') query = query.abortSignal(signal);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
export async function saveAddress(userId, input, id) {
  const { value, errors, valid } = validateAddress(input);
  if (!valid) {
    const e = Object.assign(Error('Invalid address'), { code: 'VALIDATION', fields: errors });
    throw e;
  }
  const s = await client();
  const payload = { ...value, user_id: userId, updated_at: new Date().toISOString() };

  // Save first, then enforce the single-default rule with owner-scoped updates.
  // This avoids depending on a database RPC that may not be deployed yet.
  if (value.is_default) {
    const { error: clearError } = await s
      .from('addresses')
      .update({ is_default: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_default', true);
    if (clearError) throw clearError;
  }

  const q = id
    ? s.from('addresses').update(payload).eq('id', id).eq('user_id', userId)
    : s.from('addresses').insert(payload);
  const { data, error } = await q.select().single();
  if (error) throw error;
  return data;
}
export async function deleteAddress(userId, id) {
  const s = await client();
  const { error } = await s.from('addresses').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
}
export async function setDefaultAddress(userId, id) {
  const s = await client();
  const { error } = await s.rpc('make_address_default', { p_address_id: id });
  if (error) throw error;
  return listAddresses(userId);
}
