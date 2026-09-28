const ENDPOINT = 'https://formspree.io/f/mqerbqvd';
const CENTER_VISION_API = (process.env.CENTER_VISION_API_BASE_URL || 'https://br-sweet-mountain-b46pgqvs-centerapi.compute.c-6.us-east-2.aws.neon.tech/api').replace(/\/$/, '');

async function syncCenterVision(payload) {
  const inquiry = {
    siteKey: 'LHA',
    inquiryType: String(payload.inquiryType || payload.request_type || 'general').slice(0, 80),
    fullName: String(payload.fullName || payload.name || 'Website visitor').slice(0, 160),
    email: String(payload.email || '').trim().toLowerCase() || undefined,
    phone: String(payload.phone || '').trim() || undefined,
    organizationName: String(payload.organization || '').trim().slice(0, 180) || undefined,
    message: String(payload.message || payload.details || payload.subject || 'Website inquiry').slice(0, 5000),
    locale: String(payload.language || payload.locale || 'en').slice(0, 20),
    metadata: {
      source: 'libyahoopsacademy.com',
      subject: payload.subject || null,
      country: payload.country || null,
      city: payload.city || null,
      program: payload.program || null,
      event: payload.event || null,
      orderNumber: payload.orderNumber || null,
      submittedAt: payload.submittedAt || null,
    },
  };
  const result = await fetch(`${CENTER_VISION_API}/v1/public/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(inquiry),
    signal: AbortSignal.timeout(15000),
  });
  if (!result.ok) throw new Error(`center_vision_${result.status}`);
  return result.json().catch(() => ({}));
}

const sanitize = (value) => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value, null, 2);
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ ok: false, error: 'method_not_allowed' });
  }
  const payload = request.body && typeof request.body === 'object' ? request.body : {};
  const clean = Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, sanitize(value)]));
  const body = new URLSearchParams(clean).toString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const upstream = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        Accept: 'application/json',
        'User-Agent': 'Libya-Hoops-Academy-Order-Service/3.0',
      },
      body,
      signal: controller.signal,
    });
    const text = await upstream.text();
    if (!upstream.ok) return response.status(502).json({ ok: false, error: 'formspree_rejected', status: upstream.status, detail: text.slice(0, 500) });
    let centerVision = 'synced';
    try { await syncCenterVision(payload); } catch { centerVision = 'pending'; }
    return response.status(200).json({ ok: true, provider: 'formspree', centerVision });
  } catch (error) {
    return response.status(502).json({ ok: false, error: 'formspree_delivery_failed', detail: String(error?.message || error).slice(0, 500) });
  } finally { clearTimeout(timeout); }
}
