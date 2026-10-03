const json = (res, status, body) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(body);
};

const clean = (value) => String(value ?? '').trim();

function supabasePublicConfig() {
  const url = clean(
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL
  ).replace(/\/$/, '');
  const key = clean(
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.PUBLIC_SUPABASE_ANON_KEY ||
    process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY
  );
  return url && key ? { url, key } : null;
}

async function fetchTrustedOrder(orderNumber, email) {
  const config = supabasePublicConfig();
  if (!config) throw new Error('supabase_public_config_missing');
  const response = await fetch(`${config.url}/functions/v1/lookup-guest-order`, {
    method: 'POST',
    headers: {
      apikey: config.key,
      authorization: `Bearer ${config.key}`,
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ orderNumber, email }),
    signal: AbortSignal.timeout(12000),
  });
  const text = await response.text().catch(() => '');
  if (!response.ok) throw new Error(`supabase_order_lookup_${response.status}:${text.slice(0, 200)}`);
  const payload = text ? JSON.parse(text) : null;
  return payload?.order || null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const orderNumber = clean(body.orderNumber).toUpperCase();
  const ticket = clean(body.ticket);
  const email = clean(body.email).toLowerCase();

  if (!/^LHA-\d{8}-\d{7}$/.test(orderNumber) || !/^[0-9a-f-]{36}$/i.test(ticket) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { ok: false, error: 'invalid_order_ticket' });
  }

  try {
    const row = await fetchTrustedOrder(orderNumber, email);
    if (!row) return json(res, 404, { ok: false, error: 'order_not_found' });

    const shipping = row.shipping_summary && typeof row.shipping_summary === 'object'
      ? row.shipping_summary
      : {};
    const fullName = [shipping.firstName, shipping.lastName].map(clean).filter(Boolean).join(' ') || 'LHA customer';

    return json(res, 200, {
      ok: true,
      order: {
        orderNumber: row.order_number,
        email: clean(row.customer_email).toLowerCase(),
        fullName,
        phone: clean(shipping.phone) || undefined,
        locale: clean(shipping.locale) || 'en',
        currency: clean(row.currency).toUpperCase(),
        subtotal: row.subtotal,
        discountTotal: row.discount_total,
        taxTotal: row.tax_total,
        shippingTotal: row.shipping_total,
        total: row.total,
        paymentStatus: row.payment_status,
        fulfillmentStatus: row.fulfillment_status,
        orderStatus: row.order_status,
        paymentMethod: row.payment_method,
        createdAt: row.created_at,
        shipping,
        items: Array.isArray(row.order_items) ? row.order_items : [],
      },
    });
  } catch (error) {
    return json(res, 503, {
      ok: false,
      error: 'order_export_unavailable',
      detail: String(error?.message || error).slice(0, 240),
    });
  }
}
