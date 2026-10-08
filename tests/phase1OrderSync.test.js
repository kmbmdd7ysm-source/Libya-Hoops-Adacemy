import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(file, 'utf8');

describe('phase 1 order synchronization invariants', () => {
  it('requires Center Vision synchronization before checkout success', () => {
    const notification = read('api/order-notification.js');
    const checkout = read('src/pages/CheckoutPage.jsx');

    expect(notification).toContain('/v1/public/store/lha/cod-order');
    expect(notification).toContain("centerVision: 'synced'");
    expect(notification).toContain("error: 'order_sync_failed'");
    expect(notification).toContain("stage = 'center_vision'");
    expect(checkout).toContain(
      'The order could not be fully confirmed and synchronized with store operations yet.',
    );
  });

  it('sends SKU lines to Center Vision and persists its canonical order ID', () => {
    const notification = read('api/order-notification.js');
    const checkout = read('src/pages/CheckoutPage.jsx');
    const orders = read('src/services/orders.js');

    expect(notification).toContain('const sku = clean(item?.sku).toUpperCase()');
    expect(notification).toContain('idempotencyKey');
    expect(checkout).toContain('sku: item.sku || null');
    expect(checkout).toContain('updateLocalOrderNumber(idempotencyRef.current, canonicalNumber)');
    expect(orders).toContain("source: 'center-vision'");
  });

  it('uses Center Vision for order readiness and guest lookup', () => {
    const health = read('api/order-sync-health.js');
    const lookup = read('api/center-vision-order-lookup.js');
    const orders = read('src/services/orders.js');

    expect(health).toContain("orderAuthority: 'center-vision'");
    expect(health).toContain('/v1/health/ready');
    expect(lookup).toContain('/v1/public/store/lha/order-lookup');
    expect(orders).toContain('/api/center-vision-order-lookup');
  });

  it('keeps order synchronization retryable and idempotent', () => {
    const notification = read('api/order-notification.js');

    expect(notification).toContain('idempotencyKey');
    expect(notification).toContain('for (let attempt = 0; attempt < 3; attempt += 1)');
    expect(notification).toContain('retryable: true');
  });
  it('prioritizes Center Vision status when a verified customer opens an order', () => {
    const orders = read('src/services/orders.js');
    const details = orders.slice(orders.indexOf('export async function getOrderDetails'));
    expect(details.indexOf('const live = await lookupGuestOrder(number, email)')).toBeLessThan(
      details.indexOf('if (userId) {'),
    );
    expect(details).toContain("live.source === 'center-vision'");
  });

  it('refreshes verified order tracking without requiring a page reload', () => {
    const detail = read('src/pages/OrderDetailPage.jsx');
    expect(detail).toContain('const interval = setInterval(refresh, 30_000)');
    expect(detail).toContain("document.visibilityState === 'hidden'");
    expect(detail).toContain('clearInterval(interval)');
  });

  it('maps the operational Center Vision order and fulfillment states in both languages', () => {
    const statuses = read('src/services/orderStatus.js');
    expect(statuses).toContain("draft: { category: 'pending'");
    expect(statuses).toContain("partial: { category: 'warning'");
    expect(statuses).toContain("on_hold: { category: 'warning'");
  });

  it('retains central shipment state and shows it in verified order tracking', () => {
    const orders = read('src/services/orders.js');
    const statuses = read('src/services/orderStatus.js');
    const detail = read('src/pages/OrderDetailPage.jsx');
    expect(orders).toContain('shipment: row.shipment || null');
    expect(statuses).toContain("out_for_delivery: { category: 'pending'");
    expect(detail).toContain("presentOrderStatus('shipment', order.shipment.status, lang)");
    expect(detail).toContain('order.shipment?.trackingNumber');
  });

});
