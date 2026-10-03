const clean = (value) => String(value ?? '').trim();

async function checkCenterVision() {
  const base = clean(
    process.env.CENTER_VISION_API_BASE_URL ||
    'https://br-sweet-mountain-b46pgqvs-centerapi.compute.c-6.us-east-2.aws.neon.tech/api'
  ).replace(/\/$/, '');
  try {
    const response = await fetch(`${base}/v1/health/ready`, {
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

  const centerVision = await checkCenterVision();
  const ok = centerVision.status === 'ready';
  return res.status(200).json({ ok, orderAuthority: 'center-vision', centerVision });
}
