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

function normalizeLines(syncPayload) {
  if (!Array.isArray(syncPayload?.items) || !syncPayload.items.length) {
    throw new Error('order_lines_missing');
  }
  return syncPayload.items.map((item) => {
    const sku = clean(item?.sku).toUpperCase();
    const quantity = Number(item?.quantity);
    if (!sku || !Number.isInteger(quantity) || quantity < 1) {
      throw new Error('invalid_order_line');
    }
    return { sku, quantity };
  });
}

async function syncCenterVision(syncPayload, input) {
  const idempotencyKey = clean(syncPayload?.idempotencyKey);
  const email = clean(syncPayload?.email).toLowerCase();
  const currencyCode = clean(syncPayload?.currency || input.canonicalCurrency || 'USD').toUpperCase();
  const fullName = clean(input.customerName || input.name || 'LHA customer');
  const phone = clean(input.customerPhone);
  const shippingAddress = parseObject(syncPayload?.shipping) || {};
  const lines = normalizeLines(syncPayload);

  if (!/^[0-9a-f-]{36}$/i.test(idempotencyKey)) throw new Error('invalid_idempotency_key');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('invalid_customer_email');
  if (!/^[A-Z]{3}$/.test(currencyCode)) throw new Error('invalid_currency');

  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(`${CENTER_VISION_API}/v1/public/store/lha/cod-order`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone: phone || undefined,
          locale: clean(shippingAddress.locale || input.language || 'en').toLowerCase(),
          currencyCode,
          idempotencyKey,
          sourceOrderNumber: clean(input.orderNumber) || undefined,
          shippingTotal: clean(input.canonicalShippingTotal || '0'),
          shippingAddress,
          lines,
        }),
        signal: AbortSignal.timeout(15000),
      });
      const text = await response.text().catch(() => '');
      if (!response.ok) throw new Error(`center_vision_${response.status}:${text.slice(0, 300)}`);
      const payload = text ? JSON.parse(text) : {};
      if (!payload?.publicId) throw new Error('center_vision_order_id_missing');
      return payload;
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

  let stage = 'center_vision';
  try {
    const centerVision = await syncCenterVision(syncPayload, input);
    const canonicalOrderNumber = centerVision.publicId;

    stage = 'notification';
    let notification = 'sent';
    try { await notifyFormspree(input, canonicalOrderNumber); }
    catch { notification = 'pending'; }

    return res.status(200).json({
      ok: true,
      provider: 'center-vision',
      orderNumber: canonicalOrderNumber,
      duplicate: Boolean(centerVision.duplicate),
      centerVision: 'synced',
      centerVisionOrderPublicId: canonicalOrderNumber,
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
