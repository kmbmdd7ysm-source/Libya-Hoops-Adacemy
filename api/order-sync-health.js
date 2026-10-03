const clean = (value) => String(value ?? '').trim();

function supabaseConfig() {
  const url = clean(
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.PUBLIC_SUPABASE_URL
  ).replace(/\/$/, '');
  const serviceKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  return url && serviceKey ? { url, serviceKey } : null;
}

async function checkSupabase() {
  const config = supabaseConfig();
  if (!config) return { status: 'failed', reason: 'server_config_missing' };
  try {
    const response = await fetch(`${config.url}/rest/v1/orders?select=id&limit=1`, {
      headers: {
        apikey: config.serviceKey,
        authorization: `Bearer ${config.serviceKey}`,
        accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });
    return response.ok
      ? { status: 'ready' }
      : { status: 'failed', reason: `http_${response.status}` };
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
