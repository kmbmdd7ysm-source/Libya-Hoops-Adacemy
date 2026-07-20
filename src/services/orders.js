import { getSupabase } from './supabase';

const STORAGE_KEY = 'lha-orders-v3';
const LEGACY_KEYS = ['lha-orders-v2'];
const MAX_ORDERS = 50;
const SCHEMA_VERSION = 3;
const clean = (value = '') => String(value).trim();
const emailKey = (value = '') => clean(value).toLowerCase();
const safeNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
const newId = () =>
  globalThis.crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const createIdempotencyKey = () => newId();

function storageAvailable() {
  try {
    const key = '__lha_order_storage_test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function normalizeOrder(order = {}) {
  const currency = clean(order.currency || order.canonicalCurrency || 'USD').toUpperCase();
  const displayCurrency = clean(order.displayCurrency || order.currency || 'USD').toUpperCase();
  const canonicalShippingTotal = Math.max(
    0,
    safeNumber(order.shippingTotal ?? order.shipping_total),
  );
  const originalShippingAmount = Math.max(
    0,
    safeNumber(order.shippingRate?.originalAmount ?? order.shipping_rate?.original_amount),
  );
  const inferredDisplayRate =
    displayCurrency !== currency && canonicalShippingTotal > 0 && originalShippingAmount > 0
      ? originalShippingAmount / canonicalShippingTotal
      : 1;
  const needsLegacyDisplayRepair = (displayValue, canonicalValue) =>
    displayCurrency !== currency &&
    inferredDisplayRate > 1.01 &&
    Math.abs(safeNumber(displayValue) - safeNumber(canonicalValue)) < 0.01;
  const repairedDisplayValue = (displayValue, canonicalValue) =>
    needsLegacyDisplayRepair(displayValue, canonicalValue)
      ? safeNumber(canonicalValue) * inferredDisplayRate
      : safeNumber(displayValue);
  const items = Array.isArray(order.items)
    ? order.items.map((item) => ({
        id: item.id || item.productId || item.product_id || null,
        type: item.type || item.fulfillment_type || null,
        fulfillmentType: item.fulfillmentType || item.fulfillment_type || null,
        registrationId: item.registrationId || item.registration_id || null,
        sku: item.sku || null,
        name:
          typeof item.name === 'object'
            ? item.name.en || item.name.ar || ''
            : clean(item.name || item.product_name),
        variant: item.variant || item.variant_snapshot || null,
        quantity: Math.max(1, Math.trunc(safeNumber(item.quantity) || 1)),
        unitPrice: Math.max(0, safeNumber(item.unitPrice ?? item.unit_price ?? item.price)),
        displayUnitPrice: Math.max(
          0,
          repairedDisplayValue(
            item.displayUnitPrice ??
              item.display_unit_price ??
              safeNumber(item.unitPrice ?? item.unit_price ?? item.price) * inferredDisplayRate,
            item.unitPrice ?? item.unit_price ?? item.price,
          ),
        ),
        displayLineTotal: Math.max(
          0,
          repairedDisplayValue(
            item.displayLineTotal ??
              item.display_line_total ??
              safeNumber(item.lineTotal ?? item.line_total) * inferredDisplayRate,
            item.lineTotal ??
              item.line_total ??
              safeNumber(item.unitPrice ?? item.unit_price ?? item.price) *
                Math.max(1, Math.trunc(safeNumber(item.quantity) || 1)),
          ),
        ),
        lineTotal: Math.max(
          0,
          safeNumber(
            item.lineTotal ??
              item.line_total ??
              safeNumber(item.unitPrice ?? item.unit_price ?? item.price) *
                Math.max(1, Math.trunc(safeNumber(item.quantity) || 1)),
          ),
        ),
      }))
    : [];
  return {
    schemaVersion: SCHEMA_VERSION,
    id: order.id || newId(),
    idempotencyKey: clean(order.idempotencyKey || order.idempotency_key || newId()),
    orderNumber: clean(order.orderNumber || order.order_number),
    userId: order.userId || order.user_id || null,
    email: emailKey(
      order.email || order.customerEmail || order.customer_email || order.customer?.email,
    ),
    createdAt: order.createdAt || order.created_at || new Date().toISOString(),
    updatedAt: order.updatedAt || order.updated_at || new Date().toISOString(),
    currency,
    displayCurrency,
    subtotal: Math.max(0, safeNumber(order.subtotal)),
    displaySubtotal: Math.max(
      0,
      repairedDisplayValue(
        order.displaySubtotal ??
          order.display_subtotal ??
          safeNumber(order.subtotal) * inferredDisplayRate,
        order.subtotal,
      ),
    ),
    shippingTotal: canonicalShippingTotal,
    displayShippingTotal: Math.max(
      0,
      repairedDisplayValue(
        order.displayShippingTotal ??
          order.display_shipping_total ??
          canonicalShippingTotal * inferredDisplayRate,
        canonicalShippingTotal,
      ),
    ),
    taxTotal: Math.max(0, safeNumber(order.taxTotal ?? order.tax_total)),
    discountTotal: Math.max(0, safeNumber(order.discountTotal ?? order.discount_total)),
    total: Math.max(0, safeNumber(order.total)),
    displayTotal: Math.max(
      0,
      repairedDisplayValue(
        order.displayTotal ?? order.display_total ?? safeNumber(order.total) * inferredDisplayRate,
        order.total,
      ),
    ),
    paymentMethod: clean(order.paymentMethod || order.payment_method || 'cash_on_delivery'),
    paymentStatus: clean(order.paymentStatus || order.payment_status || 'pending').toLowerCase(),
    orderStatus: clean(order.orderStatus || order.order_status || 'received').toLowerCase(),
    fulfillmentStatus: clean(
      order.fulfillmentStatus || order.fulfillment_status || 'unfulfilled',
    ).toLowerCase(),
    customer: order.customer || {},
    shipping: order.shipping || order.shipping_summary || null,
    shippingRate: order.shippingRate || order.shipping_rate || null,
    items,
    source: order.source || 'local',
    syncState: order.syncState || 'local-only',
  };
}

function parseStored(raw) {
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed.orders) ? parsed.orders : [];
  return list.filter(Boolean).map(normalizeOrder);
}

export function readLocalOrders() {
  if (!storageAvailable()) return { orders: [], error: new Error('storage_unavailable') };
  try {
    let orders = parseStored(localStorage.getItem(STORAGE_KEY));
    if (!orders.length) {
      for (const legacy of LEGACY_KEYS) {
        const migrated = parseStored(localStorage.getItem(legacy));
        if (migrated.length) {
          orders = migrated;
          writeLocalOrders(orders);
          break;
        }
      }
    }
    return { orders, error: null };
  } catch (error) {
    return { orders: [], error: new Error('storage_corrupted', { cause: error }) };
  }
}

export function writeLocalOrders(orders) {
  if (!storageAvailable()) return { ok: false, error: new Error('storage_unavailable') };
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: SCHEMA_VERSION, orders: orders.slice(0, MAX_ORDERS) }),
    );
    return { ok: true, error: null };
  } catch (error) {
    return { ok: false, error };
  }
}

function saveLocal(order) {
  const current = readLocalOrders();
  const duplicate = current.orders.find(
    (item) =>
      item.idempotencyKey === order.idempotencyKey ||
      (order.orderNumber && item.orderNumber === order.orderNumber),
  );
  if (duplicate) return { order: duplicate, duplicate: true, error: current.error };
  const write = writeLocalOrders([order, ...current.orders]);
  return { order, duplicate: false, error: write.error || current.error };
}

async function invokeOrderFunction(name, body) {
  const supabase = await getSupabase();
  if (!supabase) return { data: null, error: new Error('cloud_unconfigured') };
  const { data, error } = await supabase.functions.invoke(name, { body });
  return { data, error: error || null };
}

export async function createOrder(input, options = {}) {
  const candidate = normalizeOrder({
    ...input,
    idempotencyKey: input.idempotencyKey || options.idempotencyKey,
  });
  if (!candidate.orderNumber || !candidate.email || !candidate.items.length)
    throw new Error('invalid_order');
  const isCash = ['cash', 'cash_on_delivery', 'cod'].includes(candidate.paymentMethod);
  if (options.cloud !== false) {
    const payload = {
      idempotencyKey: candidate.idempotencyKey,
      currency: candidate.currency,
      paymentMethod: candidate.paymentMethod,
      email: candidate.email,
      shipping: candidate.shipping,
      items: candidate.items.map((item) => ({
        productId: item.id,
        variantId: item.sku ? `${item.id}:${item.sku}` : `${item.type}:${item.id}`,
        quantity: item.quantity,
        registrationId: item.registrationId || null,
      })),
    };
    const cloud = await invokeOrderFunction(
      candidate.userId ? 'create-order' : 'create-guest-order',
      payload,
    );
    if (!cloud.error && cloud.data?.order) {
      const order = normalizeOrder({ ...cloud.data.order, source: 'cloud', syncState: 'synced' });
      if (isCash) saveLocal(order);
      return { order, source: 'cloud', duplicate: Boolean(cloud.data.duplicate), warning: null };
    }
    if (!isCash) throw new Error('cloud_order_creation_failed', { cause: cloud.error });
    const local = saveLocal({ ...candidate, source: 'local', syncState: 'local-only' });
    return {
      order: local.order,
      source: 'local',
      duplicate: local.duplicate,
      warning: 'cloud_unavailable',
    };
  }
  if (!isCash) throw new Error('online_payment_requires_server');
  const local = saveLocal({ ...candidate, source: 'local', syncState: 'local-only' });
  if (local.error && !local.order) throw local.error;
  return {
    order: local.order,
    source: 'local',
    duplicate: local.duplicate,
    warning: local.error ? 'local_storage_issue' : null,
  };
}

function mapCloudOrder(row) {
  return normalizeOrder({
    ...row,
    orderNumber: row.order_number,
    idempotencyKey: row.idempotency_key,
    userId: row.user_id,
    email: row.customer_email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    shippingTotal: row.shipping_total,
    taxTotal: row.tax_total,
    discountTotal: row.discount_total,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    fulfillmentStatus: row.fulfillment_status,
    shipping: row.shipping_summary,
    items: row.order_items || row.items_snapshot || [],
    source: 'cloud',
    syncState: 'synced',
  });
}

export async function getMyOrders(userId) {
  if (!userId) return { state: 'success', orders: [], source: 'none', error: null };
  const local = readLocalOrders();
  const localOrders = local.orders.filter((order) => order.userId === userId);
  const supabase = await getSupabase();
  if (!supabase)
    return {
      state: local.error ? 'error' : localOrders.length ? 'partial' : 'success',
      orders: localOrders,
      source: 'local',
      error: local.error || (localOrders.length ? new Error('cloud_unconfigured') : null),
    };
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const cloudOrders = (data || []).map(mapCloudOrder);
    const merged = [
      ...cloudOrders,
      ...localOrders.filter(
        (localOrder) =>
          !cloudOrders.some(
            (cloudOrder) => cloudOrder.idempotencyKey === localOrder.idempotencyKey,
          ),
      ),
    ];
    return {
      state: local.error ? 'partial' : 'success',
      orders: merged,
      source: localOrders.length ? 'mixed' : 'cloud',
      error: local.error,
    };
  } catch (error) {
    return {
      state: localOrders.length ? 'partial' : 'error',
      orders: localOrders,
      source: 'local',
      error,
    };
  }
}

export async function lookupGuestOrder(orderNumber, email) {
  const number = clean(orderNumber).toUpperCase();
  const normalizedEmail = emailKey(email);
  if (!number || !normalizedEmail)
    return { state: 'invalid', order: null, source: 'none', error: null };
  const cloud = await invokeOrderFunction('lookup-guest-order', {
    orderNumber: number,
    email: normalizedEmail,
  });
  if (!cloud.error && cloud.data?.order)
    return {
      state: 'success',
      order: normalizeOrder({ ...cloud.data.order, source: 'cloud', syncState: 'synced' }),
      source: 'cloud',
      error: null,
    };
  const local = readLocalOrders();
  const order =
    local.orders.find(
      (item) =>
        clean(item.orderNumber).toUpperCase() === number &&
        emailKey(item.email) === normalizedEmail,
    ) || null;
  if (order)
    return {
      state: cloud.error ? 'partial' : 'success',
      order,
      source: 'local',
      error: cloud.error || local.error,
    };
  if (local.error && cloud.error)
    return { state: 'error', order: null, source: 'none', error: cloud.error };
  return { state: 'not-found', order: null, source: 'none', error: cloud.error || null };
}

export async function getOrderDetails({ orderNumber, userId, email }) {
  const number = clean(orderNumber).toUpperCase();
  if (!number) return { state: 'not-found', order: null, error: null };
  if (userId) {
    const result = await getMyOrders(userId);
    const order =
      result.orders.find((item) => clean(item.orderNumber).toUpperCase() === number) || null;
    return { ...result, state: order ? result.state : 'not-found', order };
  }
  if (!email) return { state: 'verification-required', order: null, error: null };
  return lookupGuestOrder(number, email);
}
