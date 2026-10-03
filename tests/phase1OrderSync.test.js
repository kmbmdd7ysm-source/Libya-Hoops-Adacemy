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
});
