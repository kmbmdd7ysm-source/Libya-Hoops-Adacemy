import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { createOrder, lookupGuestOrder } from '../src/services/orders';

vi.mock('../src/services/supabase', () => ({
  getSupabase: vi.fn(async () => null),
}));

const read = (file) => readFileSync(file, 'utf8');

describe('LASTWEB final fixes', () => {
  beforeEach(() => localStorage.clear());

  it('keeps the contact consent in the form flow and prevents horizontal page overflow', () => {
    const contact = read('src/pages/ContactPage.jsx');
    const css = read('src/styles/global.css');
    expect(contact).toContain('className="field-check contact-consent"');
    expect(contact).toContain('className="section contact-section"');
    expect(css).toContain('.contact-form .contact-consent');
    expect(css).toMatch(/grid-template-columns:\s*22px minmax\(0, 1fr\)/);
    expect(css).toMatch(/html,[\s\S]*body,[\s\S]*#root[\s\S]*overflow-x:\s*hidden/);
    expect(css).toContain("html[dir='rtl'] .contact-form .contact-consent");
  });

  it('creates, stores, displays and looks up one stable cash-on-delivery order number', async () => {
    const orderNumber = 'LHA-TEST-COD-001';
    const result = await createOrder({
      orderNumber,
      idempotencyKey: 'idem-cod-001',
      email: 'buyer@example.com',
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      orderStatus: 'received',
      total: 73,
      items: [
        {
          id: 'tee-1',
          type: 'product',
          sku: 'TEE-BLK-M',
          name: 'Tee',
          quantity: 1,
          unitPrice: 73,
          lineTotal: 73,
        },
      ],
    });

    expect(result.order.orderNumber).toBe(orderNumber);
    const lookup = await lookupGuestOrder(orderNumber, 'buyer@example.com');
    expect(lookup.order?.orderNumber).toBe(orderNumber);
    expect(lookup.order?.paymentMethod).toBe('cash_on_delivery');
  });
});
