const ENDPOINT = 'https://formspree.io/f/mqerbqvd';

function sanitize(value) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value, null, 2);
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const payload = request.body && typeof request.body === 'object' ? request.body : {};
    const params = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => params.set(key, sanitize(value)));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const upstream = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        Accept: 'application/json',
        'User-Agent': 'Libya-Hoops-Academy-Order-Service/1.0',
      },
      body: params,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const text = await upstream.text();
    if (!upstream.ok) {
      return response.status(502).json({
        ok: false,
        error: 'formspree_rejected',
        status: upstream.status,
        detail: text.slice(0, 300),
      });
    }
    return response.status(200).json({ ok: true });
  } catch (error) {
    return response.status(502).json({
      ok: false,
      error: 'formspree_unreachable',
      detail: String(error?.message || error).slice(0, 300),
    });
  }
}
