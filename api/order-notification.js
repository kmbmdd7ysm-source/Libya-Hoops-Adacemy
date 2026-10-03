const ENDPOINT = process.env.FORMSPREE_ORDER_ENDPOINT || process.env.VITE_FORM_ENDPOINT || 'https://formspree.io/f/mqerbqvd';
const CENTER_VISION_API = (process.env.CENTER_VISION_API_BASE_URL || 'https://br-sweet-mountain-b46pgqvs-centerapi.compute.c-6.us-east-2.aws.neon.tech/api').replace(/\/$/, '');

const safe = (value, max = 12000) => String(value ?? '').replace(/\0/g, '').slice(0, max);
const clean = (value) => String(value ?? '').trim();

function parseObject(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function supabaseConfig() {
  const url = clean(
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.PUBLIC_SUPABASE_URL
  ).replace(/\/$/, '');
  const serviceKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  return url && serviceKey ? { url, serviceKey } : null;
}

async function supabaseRequest(path, options = {}) {
  const config = supabaseConfig();
  if (!config) throw new Error('supabase_server_config_missing');
  const response = await fetch(`${config.url}${path}`, {
    ...options,
    headers: {
      apikey: config.serviceKey,
      authorization: `Bearer ${config.serviceKey}`,
      accept: 'application/json',
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(15000),
  });
  const text = await response.text().catch(() => '');
  let payload = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = null; }
  if (!response.ok) throw new Error(`supabase_${response.status}:${text.slice(0, 300)}`);
  return payload;
}

async function existingOrderByTicket(ticket) {
  const query = new URLSearchParams({
    select: 'order_number,idempotency_key',
    idempotency_key: `eq.${ticket}`,
    limit: '1',
  });
  const rows = await supabaseRequest(`/rest/v1/orders?${query.toString()}`);
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function ensureCloudOrder(syncPayload) {
  const idempotencyKey = clean(syncPayload?.idempotencyKey);
  const email = clean(syncPayload?.email).toLowerCase();
  const currency = clean(syncPayload?.currency).toUpperCase();
  const paymentMethod = clean(syncPayload?.paymentMethod || 'cash_on_delivery').toLowerCase();
  const shipping = parseObject(syncPayload?.shipping) || syncPayload?.shipping || {};
  const items = Array.isArray(syncPayload?.items) ? syncPayload.items : [];

  if (!/^[0-9a-f-]{36}$/i.test(idempotencyKey)) throw new Error('invalid_idempotency_key');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('invalid_customer_email');
  if (!['USD', 'LYD'].includes(currency)) throw new Error('invalid_currency');
  if (!['cash_on_delivery', 'cash'].includes(paymentMethod)) throw new Error('invalid_payment_method');
  if (!items.length || items.length > 50) throw new Error('invalid_order_items');

  const normalizedItems = items.map((item) => ({
    productId: clean(item?.productId),
    variantId: clean(item?.variantId),
    quantity: Number(item?.quantity),
    registrationId: clean(item?.registrationId) || null,
  }));
  if (normalizedItems.some((item) => !item.productId || !item.variantId || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) {
    throw new Error('invalid_order_items');
  }

  const existing = await existingOrderByTicket(idempotencyKey);
  if (existing?.order_number) return { orderNumber: existing.order_number, duplicate: true };

  const result = await supabaseRequest('/rest/v1/rpc/create_order_transactional', {
    method: 'POST',
    body: JSON.stringify({
      p_user_id: null,
      p_customer_email: email,
      p_currency: currency,
      p_payment_method: paymentMethod,
      p_idempotency_key: idempotencyKey,
      p_shipping: shipping,
      p_items: normalizedItems,
    }),
  });

  const order = result?.order;
  if (!order?.order_number) throw new Error('cloud_order_creation_invalid');
  return { orderNumber: order.order_number, duplicate: Boolean(result?.duplicate) };
}

async function syncCenterVision(orderNumber, ticket) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(`${CENTER_VISION_API}/v1/public/store/lha/sync-order`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ orderNumber, ticket }),
        signal: AbortSignal.timeout(15000),
      });
      const text = await response.text().catch(() => '');
      if (!response.ok) throw new Error(`center_vision_${response.status}:${text.slice(0, 240)}`);
      return text ? JSON.parse(text) : {};
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 350 * 2 ** attempt));
    }
  }
  throw lastError || new Error('center_vision_sync_failed');
}

async function notifyFormspree(input, canonicalOrderNumber) {
  const message = safe(input.message).replace(/^Order number:.*$/m, `Order number: ${canonicalOrderNumber}`);
  const params = new URLSearchParams({
    _subject: safe(input._subject || `New LHA order ${canonicalOrderNumber}`, 180).replace(safe(input.orderNumber, 80), canonicalOrderNumber),
    _template: 'table',
    form_type: 'order',
    order_number: canonicalOrderNumber,
    customer_name: safe(input.customerName || input.name, 160),
    customer_email: safe(input.customerEmail || input.email, 240),
    customer_phone: safe(input.customerPhone, 80),
    payment_method: safe(input.paymentMethod, 100),
    total: safe(input.total, 100),
    currency: safe(input.currency, 20),
    email: safe(input.customerEmail || input.email, 240),
    _replyto: safe(input.customerEmail || input.email, 240),
    message,
  });
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: params.toString(),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`formspree_${response.status}:${detail.slice(0, 240)}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }
  if (Number(req.headers['content-length'] || 0) > 64_000) {
    return res.status(413).json({ ok: false, error: 'request_too_large' });
  }

  const input = req.body && typeof req.body === 'object' ? req.body : {};
  const syncPayload = parseObject(input.syncPayload);
  if (!input.orderNumber || !input.message || !syncPayload) {
    return res.status(400).json({ ok: false, error: 'missing_order_sync_payload' });
  }

  let stage = 'supabase';
  try {
    const cloud = await ensureCloudOrder(syncPayload);
    const ticket = clean(syncPayload.idempotencyKey);

    stage = 'center_vision';
    const centerVision = await syncCenterVision(cloud.orderNumber, ticket);

    stage = 'notification';
    let notification = 'sent';
    try { await notifyFormspree(input, cloud.orderNumber); }
    catch { notification = 'pending'; }

    return res.status(200).json({
      ok: true,
      provider: 'center-vision+supabase',
      orderNumber: cloud.orderNumber,
      duplicate: cloud.duplicate,
      centerVision: 'synced',
      centerVisionOrderPublicId: centerVision?.publicId || null,
      notification,
    });
  } catch (error) {
    const detail = safe(error?.message || error, 500);
    console.error('LHA_ORDER_SYNC_FAILED', { stage, detail });
    return res.status(502).json({
      ok: false,
      error: 'order_sync_failed',
      stage,
      detail,
      retryable: true,
    });
  }
}
