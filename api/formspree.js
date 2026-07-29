const ENDPOINT = 'https://formspree.io/f/mqerbqvd';

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
    return response.status(200).json({ ok: true, provider: 'formspree' });
  } catch (error) {
    return response.status(502).json({ ok: false, error: 'formspree_delivery_failed', detail: String(error?.message || error).slice(0, 500) });
  } finally { clearTimeout(timeout); }
}
