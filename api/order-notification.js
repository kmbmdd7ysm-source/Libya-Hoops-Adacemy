const ENDPOINT = process.env.FORMSPREE_ORDER_ENDPOINT || process.env.VITE_FORM_ENDPOINT || 'https://formspree.io/f/mqerbqvd';

const safe = (value, max = 12000) => String(value ?? '').replace(/\0/g, '').slice(0, max);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }
  const input = req.body && typeof req.body === 'object' ? req.body : {};
  if (!input.orderNumber || !input.message) {
    return res.status(400).json({ ok: false, error: 'missing_order_payload' });
  }
  const params = new URLSearchParams({
    _subject: safe(input._subject || `New LHA order ${input.orderNumber}`, 180),
    _template: 'table',
    form_type: 'order',
    order_number: safe(input.orderNumber, 80),
    customer_name: safe(input.customerName || input.name, 160),
    customer_email: safe(input.customerEmail || input.email, 240),
    customer_phone: safe(input.customerPhone, 80),
    payment_method: safe(input.paymentMethod, 100),
    total: safe(input.total, 100),
    currency: safe(input.currency, 20),
    email: safe(input.customerEmail || input.email, 240),
    _replyto: safe(input.customerEmail || input.email, 240),
    message: safe(input.message),
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const upstream = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: params.toString(),
      signal: controller.signal,
    });
    const text = await upstream.text();
    if (!upstream.ok) {
      return res.status(502).json({ ok: false, error: 'formspree_rejected', status: upstream.status, detail: text.slice(0, 500) });
    }
    return res.status(200).json({ ok: true, provider: 'formspree', orderNumber: input.orderNumber });
  } catch (error) {
    return res.status(502).json({ ok: false, error: 'formspree_delivery_failed', detail: safe(error?.message || error, 500) });
  } finally {
    clearTimeout(timeout);
  }
}
