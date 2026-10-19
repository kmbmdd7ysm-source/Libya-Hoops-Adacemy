import { afterEach, describe, expect, it, vi } from 'vitest';
import { canSubmitCodCart, requiresNonCodCheckout } from '../src/utils/commerceGuard';
import handler from '../api/order-notification.js';

const clothing = {
  id: 'tee',
  type: 'product',
  sku: 'LHA-TEE-001',
  quantity: 2,
  fulfillmentType: 'physical',
};
const training = {
  id: 'base',
  type: 'training',
  sku: '',
  quantity: 1,
  fulfillmentType: 'digital_training',
};

function response() {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader() {},
    json(body) {
      this.body = body;
      return this;
    },
  };
}
const request = (changes = {}) => ({
  method: 'POST',
  headers: {},
  body: {
    orderNumber: 'LHA00001234',
    message: 'Order number: LHA00001234\\nCustomer test',
    paymentMethod: 'Cash on Delivery',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    syncPayload: JSON.stringify({
      idempotencyKey: '12345678-1234-4123-8123-123456789abc',
      email: 'test@example.com',
      currency: 'USD',
      paymentMethod: 'cash_on_delivery',
      shipping: { country: 'LY', address: 'Test address' },
      items: [{ sku: 'LHA-TEE-001', quantity: 2, type: 'product', fulfillmentType: 'physical' }],
    }),
    ...changes,
  },
});

afterEach(() => vi.restoreAllMocks());

describe('COD boundaries', () => {
  it('allows only properly keyed physical SKU products in Libya', () => {
    expect(canSubmitCodCart([clothing], 'LY')).toBe(true);
    expect(canSubmitCodCart([clothing], 'US')).toBe(false);
    expect(canSubmitCodCart([training], 'LY')).toBe(false);
    expect(canSubmitCodCart([clothing, training], 'LY')).toBe(false);
    expect(canSubmitCodCart([{ ...clothing, quantity: 100 }], 'LY')).toBe(false);
    expect(requiresNonCodCheckout([clothing, training])).toBe(true);
  });
  it('rejects digital and event lines before sending any request to operations', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch');
    const bad = request();
    const data = JSON.parse(bad.body.syncPayload);
    data.items[0] = { ...data.items[0], type: 'training', fulfillmentType: 'digital_training' };
    bad.body.syncPayload = JSON.stringify(data);
    const res = response();
    await handler(bad, res);
    expect(res.statusCode).toBe(502);
    expect(res.body.ok).toBe(false);
    expect(res.body).not.toHaveProperty('detail');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('rejects physical COD outside Libya on the server', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch');
    const req = request();
    const data = JSON.parse(req.body.syncPayload);
    data.shipping.country = 'US';
    req.body.syncPayload = JSON.stringify(data);
    const res = response();
    await handler(req, res);
    expect(res.statusCode).toBe(502);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('requires idempotency and valid quantities', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch');
    const req = request();
    const data = JSON.parse(req.body.syncPayload);
    data.items[0].quantity = 0;
    req.body.syncPayload = JSON.stringify(data);
    const res = response();
    await handler(req, res);
    expect(res.body.ok).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('accepts physical COD only after Center Vision returns a public order ID', async () => {
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ publicId: 'LH-ORD-TEST', duplicate: false }),
      })
      .mockResolvedValueOnce({ ok: true, text: async () => '{}' });
    const res = response();
    await handler(request(), res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      ok: true,
      provider: 'center-vision',
      orderNumber: 'LH-ORD-TEST',
      centerVision: 'synced',
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
