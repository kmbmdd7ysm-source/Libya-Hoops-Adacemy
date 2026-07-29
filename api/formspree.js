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

  const payload = request.body && typeof request.body === 'object' ? request.body : {};
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, sanitize(value)]),
  );

  const attempts = [
    {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(cleanPayload),
    },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        Accept: 'application/json',
      },
      body: new URLSearchParams(cleanPayload),
    },
  ];

  const failures = [];
  for (const attempt of attempts) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const upstream = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          ...attempt.headers,
          'User-Agent': 'Libya-Hoops-Academy-Order-Service/2.0',
        },
        body: attempt.body,
        signal: controller.signal,
      });
      const text = await upstream.text();
      if (upstream.ok) {
        clearTimeout(timeout);
        return response.status(200).json({ ok: true, provider: 'formspree' });
      }
      failures.push(`${upstream.status}:${text.slice(0, 200)}`);
    } catch (error) {
      failures.push(String(error?.message || error).slice(0, 200));
    } finally {
      clearTimeout(timeout);
    }
  }

  return response.status(502).json({
    ok: false,
    error: 'formspree_delivery_failed',
    detail: failures.join(' | ').slice(0, 500),
  });
}
