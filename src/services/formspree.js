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

const retry = async (operation, attempts = 3) => {
  let lastError;
  for (let index = 0; index < attempts; index += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (index < attempts - 1) await wait(350 * 2 ** index);
    }
  }
  throw lastError;
};

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


const QUEUE_KEY = 'lha-formspree-retry-v1';
const readQueue = () => {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
};
const writeQueue = (items) => localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-20)));
const queuePayload = (body) => {
  const items = readQueue();
  items.push({ id: crypto.randomUUID?.() || String(Date.now()), body, createdAt: new Date().toISOString() });
  writeQueue(items);
};

export async function retryPendingFormspree() {
  const pending = readQueue();
  if (!pending.length) return { sent: 0, remaining: 0 };
  const remaining = [];
  let sent = 0;
  for (const item of pending) {
    try { await retry(() => postThroughSite(item.body), 2); sent += 1; }
    catch { remaining.push(item); }
  }
  writeQueue(remaining);
  return { sent, remaining: remaining.length };
}
export async function sendFormspree(payload, subject = 'Libya Hoops Academy website message') {
  const body = normalizePayload(payload, subject);
  const failures = [];

  // Use the same-origin Vercel function first. It avoids browser CORS/privacy blockers
  // and keeps the Formspree endpoint out of the checkout UI.
  try {
    return await retry(() => postThroughSite(body), 3);
  } catch (error) {
    failures.push(error);
  }

  // Direct browser delivery remains a fallback for local/static previews.
  try {
    return await retry(() => postDirect(body), 2);
  } catch (error) {
    failures.push(error);
  }

  queuePayload(body);
  throw new Error(failures.map((error) => error?.message || String(error)).join('; '));
}
