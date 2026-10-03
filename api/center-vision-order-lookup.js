const CENTER_VISION_API = (process.env.CENTER_VISION_API_BASE_URL || 'https://br-sweet-mountain-b46pgqvs-centerapi.compute.c-6.us-east-2.aws.neon.tech/api').replace(/\/$/, '');
const clean = (value) => String(value ?? '').trim();

const json = (res, status, body) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(body);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const orderNumber = clean(body.orderNumber).toUpperCase();
  const email = clean(body.email).toLowerCase();

  if (!/^LH-ORD-\d{7}$/.test(orderNumber) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { ok: false, error: 'invalid_lookup' });
  }

  try {
    const response = await fetch(`${CENTER_VISION_API}/v1/public/store/lha/order-lookup`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ orderNumber, email }),
      signal: AbortSignal.timeout(12000),
    });
    const text = await response.text().catch(() => '');
    if (response.status === 404) return json(res, 404, { ok: false, error: 'order_not_found' });
    if (!response.ok) return json(res, 503, { ok: false, error: 'center_vision_unavailable' });
    const order = text ? JSON.parse(text) : null;
    if (!order?.publicId) return json(res, 502, { ok: false, error: 'invalid_center_vision_response' });
    return json(res, 200, { ok: true, order });
  } catch {
    return json(res, 503, { ok: false, error: 'center_vision_unavailable' });
  }
}
