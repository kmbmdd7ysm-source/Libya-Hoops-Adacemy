const json = (res, status, body) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(body);
};

const clean = (value) => String(value ?? '').trim();

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

async function fetchTrustedOrder(orderNumber, ticket) {
  const config = supabaseConfig();
  if (!config) throw new Error('supabase_server_config_missing');

  const query = new URLSearchParams({
    select: 'id,order_number,customer_email,currency,subtotal,shipping_total,tax_total,discount_total,total,payment_method,payment_status,order_status,fulfillment_status,shipping_summary,created_at,idempotency_key,order_items(product_id,variant_id,sku,product_name,variant_snapshot,quantity,unit_price,line_total)',
    order_number: `eq.${orderNumber}`,
    idempotency_key: `eq.${ticket}`,
    limit: '1',
  });

  const response = await fetch(`${config.url}/rest/v1/orders?${query.toString()}`, {
    headers: {
      apikey: config.serviceKey,
      authorization: `Bearer ${config.serviceKey}`,
      accept: 'application/json',
    },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`supabase_order_lookup_${response.status}:${detail.slice(0, 200)}`);
  }
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] || null : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const orderNumber = clean(body.orderNumber).toUpperCase();
  const ticket = clean(body.ticket);

  if (!/^LHA-\d{8}-\d{7}$/.test(orderNumber) || !/^[0-9a-f-]{36}$/i.test(ticket)) {
    return json(res, 400, { ok: false, error: 'invalid_order_ticket' });
  }

  try {
    const row = await fetchTrustedOrder(orderNumber, ticket);
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
