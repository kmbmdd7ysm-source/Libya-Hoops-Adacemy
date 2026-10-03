import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(file, 'utf8');

describe('phase 1 order synchronization invariants', () => {
  it('requires Center Vision synchronization before checkout success', () => {
    const notification = read('api/order-notification.js');
    const checkout = read('src/pages/CheckoutPage.jsx');

    expect(notification).toContain('/v1/public/store/lha/sync-order');
    expect(notification).toContain("centerVision: 'synced'");
    expect(notification).toContain("error: 'order_sync_failed'");
    expect(notification).toContain("stage = 'center_vision'");
    expect(checkout).toContain(
      'The order could not be fully confirmed and synchronized with store operations yet.',
    );
  });

  it('verifies the canonical Supabase order without a Vercel service-role key', () => {
    const notification = read('api/order-notification.js');
    const orderExport = read('api/center-vision-order-export.js');

    expect(notification).toContain("invokeSupabaseFunction('lookup-guest-order'");
    expect(notification).toContain(
      'syncCenterVision(cloud.orderNumber, ticket, cloud.email)',
    );
    expect(orderExport).toContain('/functions/v1/lookup-guest-order');
    expect(orderExport).toContain('const email = clean(body.email).toLowerCase()');
    expect(notification).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(orderExport).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
  });

  it('keeps the readiness probe secret-free and checks both dependencies', () => {
    const health = read('api/order-sync-health.js');

    expect(health).toContain('/functions/v1/create-guest-order');
    expect(health).toContain("reason: 'public_config_missing'");
    expect(health).toContain('/v1/health/live');
    expect(health).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
  });

  it('keeps order synchronization retryable and idempotent', () => {
    const notification = read('api/order-notification.js');

    expect(notification).toContain('idempotencyKey');
    expect(notification).toContain('for (let attempt = 0; attempt < 3; attempt += 1)');
    expect(notification).toContain('retryable: true');
  });
});
