export const FORMSPREE_ENDPOINT =
  import.meta.env.VITE_FORM_ENDPOINT?.trim() || 'https://formspree.io/f/mqerbqvd';

const stringifyValue = (value) => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const retry = async (operation, attempts = 3) => {
  let lastError;
  for (let index = 0; index < attempts; index += 1) {
    try { return await operation(); }
    catch (error) {
      lastError = error;
      if (index < attempts - 1) await wait(400 * 2 ** index);
    }
  }
  throw lastError;
};

async function postDirect(body) {
  const form = new FormData();
  Object.entries(body).forEach(([key, value]) => form.append(key, value));
  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: form,
    cache: 'no-store',
  });
  const detail = await response.text().catch(() => '');
  if (!response.ok) throw new Error(`formspree_direct_failed:${response.status}:${detail.slice(0, 240)}`);
  return response;
}

async function postThroughSite(body) {
  const response = await fetch('/api/formspree', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    credentials: 'same-origin',
    cache: 'no-store',
  });
  const detail = await response.text().catch(() => '');
  if (!response.ok) throw new Error(`formspree_proxy_failed:${response.status}:${detail.slice(0, 240)}`);
  return response;
}

const QUEUE_KEY = 'lha-formspree-retry-v2';
const readQueue = () => {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
};
const writeQueue = (items) => localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-25)));
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
    try {
      await retry(() => postDirect(item.body), 2);
      sent += 1;
    } catch {
      try {
        await retry(() => postThroughSite(item.body), 2);
        sent += 1;
      } catch { remaining.push(item); }
    }
  }
  writeQueue(remaining);
  return { sent, remaining: remaining.length };
}

export async function sendFormspree(payload, subject = 'Libya Hoops Academy website message') {
  const body = normalizePayload(payload, subject);
  const failures = [];

  // Use the exact same browser-to-Formspree delivery path as newsletter/subscribe forms.
  try { return await retry(() => postDirect(body), 3); }
  catch (error) { failures.push(error); }

  // Vercel serverless fallback for browsers or privacy tools that block direct form requests.
  try { return await retry(() => postThroughSite(body), 3); }
  catch (error) { failures.push(error); }

  queuePayload(body);
  throw new Error(failures.map((error) => error?.message || String(error)).join('; '));
}
