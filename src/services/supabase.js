let clientPromise;
let configPromise;

async function resolveConfig() {
  const buildUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  const buildKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (buildUrl && buildKey) return { url: buildUrl, key: buildKey };
  if (!configPromise) {
    configPromise = fetch('/api/public-config', { cache: 'no-store', credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = await response.json();
        return data?.supabaseUrl && data?.supabaseAnonKey
          ? { url: data.supabaseUrl, key: data.supabaseAnonKey }
          : null;
      })
      .catch(() => null);
  }
  return configPromise;
}

export async function getSupabase() {
  const config = await resolveConfig();
  if (!config) return null;
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(config.url, config.key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
          storageKey: 'lha-auth-session-v1',
        },
      }),
    );
  }
  return clientPromise;
}
