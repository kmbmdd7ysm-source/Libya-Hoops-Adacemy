export const FORMSPREE_ENDPOINT =
  import.meta.env.VITE_FORM_ENDPOINT?.trim() || 'https://formspree.io/f/mqerbqvd';

const stringifyValue = (value) => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value, null, 2);
};

const normalizePayload = (payload, subject) => {
  const customerEmail = payload?.customerEmail || payload?.email || payload?.customer?.email || '';
  const normalized = {
    _subject: subject,
    form_type: payload?.formType || 'website',
    email: customerEmail,
    _replyto: customerEmail,
  };
  Object.entries(payload || {}).forEach(([key, value]) => {
    normalized[key] = stringifyValue(value);
  });
  return normalized;
};

const toFormBody = (payload) => {
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => params.set(key, value));
  return params;
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function postThroughSite(body) {
  const response = await fetch('/api/formspree', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    credentials: 'same-origin',
    cache: 'no-store',
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`order_notification_proxy_failed:${response.status}:${detail.slice(0, 200)}`);
  }
  return response;
}

async function postDirect(body) {
  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      Accept: 'application/json',
    },
    body: toFormBody(body),
    credentials: 'omit',
    cache: 'no-store',
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`formspree_delivery_failed:${response.status}:${detail.slice(0, 200)}`);
  }
  return response;
}

export async function sendFormspree(payload, subject = 'Libya Hoops Academy website message') {
  const body = normalizePayload(payload, subject);
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      // Vercel server-side delivery avoids Safari/CORS/content-blocker failures.
      return await postThroughSite(body);
    } catch (proxyError) {
      try {
        return await postDirect(body);
      } catch (directError) {
        lastError = new Error(`${proxyError.message}; ${directError.message}`);
        if (attempt < 2) await wait(600 * 2 ** attempt);
      }
    }
  }
  throw lastError || new Error('formspree_delivery_failed');
}
