import { getSupabase } from './supabase';

export function validateUsdToLydRate(value) {
  const rate = Number(value);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error('invalid_exchange_rate');
  return rate;
}

export async function fetchUsdToLydRate() {
  const supabase = await getSupabase();
  if (!supabase) throw new Error('commerce_settings_unavailable');
  const { data, error } = await supabase.rpc('get_public_commerce_settings');
  if (error) throw error;
  return validateUsdToLydRate(data?.usd_to_lyd_rate);
}
