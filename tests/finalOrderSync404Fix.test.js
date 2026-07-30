import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(file, 'utf8');

describe('final cross-device order, total, and refresh fixes', () => {
  it('uses the saved display total on every order card', () => {
    const card = read('src/components/account/OrderCard.jsx');
    expect(card).toContain('(order.displayTotal ?? order.total).toFixed(2)');
    expect(card).not.toContain('{order.total.toFixed(2)} {order.displayCurrency}');
  });

  it('stores authenticated order history in the existing RLS-protected user state', () => {
    const orders = read('src/services/orders.js');
    const cloudState = read('src/services/sync/cloudState.js');
    expect(orders).toContain("const CLOUD_ORDER_HISTORY_KEY = 'orderHistory'");
    expect(orders).toContain('saveCloudHistoryOrder(candidate)');
    expect(orders).toContain('writeCloudOrderHistory(userId');
    expect(orders).toContain(".from('user_state')");
    expect(cloudState).toContain('existingPreferences');
    expect(cloudState).toContain(
      'preferences: { ...existingPreferences, ...(state.preferences || {}) }',
    );
  });

  it('keeps API routes excluded while routing SPA refreshes to the application root', () => {
    const vercel = JSON.parse(read('vercel.json'));
    expect(vercel.rewrites).toEqual([
      { source: '/((?!api/).*)', destination: '/' },
    ]);
  });

  it('does not cache private order pages in the service worker', () => {
    const worker = read('public/sw.js');
    expect(worker).toContain('\\/order-tracking\\b');
    expect(worker).toContain('lha-v6-20260730-order-sync-route');
  });
});
