const CENTER_VISION_API = (
  process.env.CENTER_VISION_API_BASE_URL ||
  'https://br-sweet-mountain-b46pgqvs-centerapi.compute.c-6.us-east-2.aws.neon.tech/api'
).replace(/\/$/, '');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }
  try {
    const response = await fetch(`${CENTER_VISION_API}/v1/public/store/inventory?siteKey=LHA`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(12000),
      cache: 'no-store',
    });
    if (!response.ok) return res.status(503).json({ ok: false, error: 'inventory_unavailable' });
    const data = await response.json();
    if (!Array.isArray(data?.variants) || !['center-vision', 'not-enabled'].includes(data?.authority)) {
      return res.status(502).json({ ok: false, error: 'invalid_inventory_response' });
    }
    return res.status(200).json({ ok: true, ...data });
  } catch {
    return res.status(503).json({ ok: false, error: 'inventory_unavailable' });
  }
}
