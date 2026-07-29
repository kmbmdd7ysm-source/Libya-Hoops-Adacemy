export const FORMSPREE_ENDPOINT =
  import.meta.env.VITE_FORM_ENDPOINT?.trim() || 'https://formspree.io/f/mqerbqvd';

const stringifyValue = (value) => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value, null, 2);
};

const normalizePayload = (payload, subject) => {
  const customerEmail = payload?.customerEmail || payload?.email || '';
  const normalized = {
    _subject: subject,
    _template: 'table',
    form_type: payload?.formType || 'website',
    name: payload?.customerName || payload?.name || 'LHA customer',
    email: customerEmail,
    _replyto: customerEmail,
  };
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (!['items', 'shippingAddress'].includes(key)) normalized[key] = stringifyValue(value);
  });
  return normalized;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function retry(operation, attempts = 3) {
  let lastError;
  for (let index = 0; index < attempts; index += 1) {
    try { return await operation(); }
    catch (error) {
      lastError = error;
      if (index < attempts - 1) await wait(350 * 2 ** index);
    }
  }
  throw lastError;
}

async function postJson(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    credentials: 'same-origin',
    cache: 'no-store',
  });
  const text = await response.text().catch(() => '');
  if (!response.ok) throw new Error(`${path}:${response.status}:${text.slice(0, 300)}`);
  let result = {};
  try { result = text ? JSON.parse(text) : {}; } catch { result = {}; }
  if (result.ok === false) throw new Error(`${path}:provider_rejected`);
  return result;
}

async function postDirect(body) {
  const form = new URLSearchParams();
  Object.entries(body).forEach(([key, value]) => form.set(key, value));
  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: form.toString(),
    cache: 'no-store',
  });
  const detail = await response.text().catch(() => '');
  if (!response.ok) throw new Error(`formspree:${response.status}:${detail.slice(0, 300)}`);
  return { ok: true, provider: 'formspree-direct' };
}

const QUEUE_KEY = 'lha-formspree-retry-v3';
const readQueue = () => { try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; } };
const writeQueue = (items) => localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-25)));
const queuePayload = (body) => writeQueue([...readQueue(), { id: crypto.randomUUID?.() || String(Date.now()), body }]);

export async function retryPendingFormspree() {
  const pending = readQueue();
  const remaining = [];
  let sent = 0;
  for (const item of pending) {
    try { await retry(() => postJson('/api/formspree', item.body), 2); sent += 1; }
    catch { remaining.push(item); }
  }
  writeQueue(remaining);
  return { sent, remaining: remaining.length };
}

export async function sendFormspree(payload, subject = 'Libya Hoops Academy website message') {
  const body = normalizePayload(payload, subject);
  const errors = [];
  const isOrder = body.form_type === 'order';

  // Server-side delivery is the primary path for orders: no browser CORS,
  // ad-blocker, Safari privacy, or page-navigation interruption can swallow it.
  if (isOrder) {
    try { return await retry(() => postJson('/api/order-notification', body), 3); }
    catch (error) { errors.push(error); }
  }
  try { return await retry(() => postJson('/api/formspree', body), 3); }
  catch (error) { errors.push(error); }
  try { return await retry(() => postDirect(body), 2); }
  catch (error) { errors.push(error); }

  queuePayload(body);
  throw new Error(errors.map((error) => error?.message || String(error)).join('; '));
}
