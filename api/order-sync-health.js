const clean = (value) => String(value ?? '').trim();

function supabasePublicConfig() {
  const url = clean(
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL
  ).replace(/\/$/, '');
  const key = clean(
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.PUBLIC_SUPABASE_ANON_KEY ||
    process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY
  );
  return url && key ? { url, key } : null;
}

async function checkSupabase() {
  const config = supabasePublicConfig();
  if (!config) return { status: 'failed', reason: 'public_config_missing' };
  try {
    const response = await fetch(`${config.url}/functions/v1/create-guest-order`, {
      method: 'POST',
      headers: {
        apikey: config.key,
        authorization: `Bearer ${config.key}`,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(8000),
    });
    const text = await response.text().catch(() => '');
    let payload = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = null;
    }
    const ready = response.status === 400 && payload?.error === 'invalid_request';
    return ready
      ? { status: 'ready' }
      : { status: 'failed', reason: `edge_${response.status}` };
  } catch {
    return { status: 'failed', reason: 'unreachable' };
  }
}

async function checkCenterVision() {
  const base = clean(
    process.env.CENTER_VISION_API_BASE_URL ||
    'https://br-sweet-mountain-b46pgqvs-centerapi.compute.c-6.us-east-2.aws.neon.tech/api'
  ).replace(/\/$/, '');
  try {
    const response = await fetch(`${base}/v1/health/live`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    return response.ok
      ? { status: 'ready' }
      : { status: 'failed', reason: `http_${response.status}` };
  } catch {
    return { status: 'failed', reason: 'unreachable' };
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const [supabase, centerVision] = await Promise.all([checkSupabase(), checkCenterVision()]);
  const ok = supabase.status === 'ready' && centerVision.status === 'ready';
  return res.status(200).json({ ok, supabase, centerVision });
}
