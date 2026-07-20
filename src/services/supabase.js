let clientPromise;
export async function getSupabase() {
  const url = import.meta.env.VITE_SUPABASE_URL,
    key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!clientPromise)
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url, key, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      }),
    );
  return clientPromise;
}
