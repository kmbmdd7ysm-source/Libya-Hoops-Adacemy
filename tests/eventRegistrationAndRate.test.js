import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  cartRequiresPhysicalShipping,
  FULFILLMENT_TYPES,
  getCartItemFulfillmentType,
} from '../src/utils/fulfillment';
import { resolveShipping } from '../src/config/shipping';
import { validateRegistrationInput } from '../src/services/eventRegistrations';
import { validateUsdToLydRate } from '../src/services/commerceSettings';

describe('event registration and trusted rate corrections', () => {
  it('keeps physical, digital training and event registration distinct', () => {
    const event = { type: 'event', fulfillmentType: 'event_registration' };
    const training = { type: 'training', fulfillmentType: 'digital_training' };
    const physical = { type: 'product', fulfillmentType: 'physical' };
    expect(getCartItemFulfillmentType(event)).toBe(FULFILLMENT_TYPES.EVENT_REGISTRATION);
    expect(getCartItemFulfillmentType(training)).toBe(FULFILLMENT_TYPES.DIGITAL_TRAINING);
    expect(getCartItemFulfillmentType(physical)).toBe(FULFILLMENT_TYPES.PHYSICAL);
    expect(cartRequiresPhysicalShipping([event, training])).toBe(false);
    expect(cartRequiresPhysicalShipping([event, physical])).toBe(true);
  });

  it('applies no physical shipping to event-only and mixed nonphysical carts', () => {
    expect(resolveShipping('ZZ', { hasPhysical: false, subtotalUsd: 200 })).toMatchObject({
      status: 'no_physical_shipping',
      canonicalAmount: 0,
    });
  });

  it('uses the full mixed subtotal only when physical merchandise exists', () => {
    expect(
      resolveShipping('LY', { hasPhysical: true, subtotalUsd: 40, usdToLydRate: 9 })
        .canonicalAmount,
    ).toBe(2.22);
    expect(
      resolveShipping('LY', { hasPhysical: true, subtotalUsd: 75, usdToLydRate: 9 })
        .canonicalAmount,
    ).toBe(0);
    expect(
      resolveShipping('US', { hasPhysical: true, subtotalUsd: 75, usdToLydRate: 9 }).status,
    ).toBe('quote_required');
  });

  it('validates minimum registration data without collecting unnecessary fields', () => {
    expect(
      validateRegistrationInput({ customerName: 'Test Player', email: 'player@example.com' }),
    ).toMatchObject({ participantName: 'Test Player' });
    expect(() => validateRegistrationInput({ customerName: '', email: 'bad' })).toThrow();
  });

  it('rejects missing, non-finite and non-positive exchange rates', () => {
    for (const value of [null, 0, -1, NaN, Infinity, 'bad'])
      expect(() => validateUsdToLydRate(value)).toThrow('invalid_exchange_rate');
    expect(validateUsdToLydRate('9')).toBe(9);
  });

  it('enforces registration, price, capacity, idempotency and read-only rate rules in SQL', () => {
    const sql = readFileSync(
      'supabase/migrations/20260718_zz_atomic_inventory_reservation.sql',
      'utf8',
    );
    for (const required of [
      'event_registrations',
      'create_event_registration',
      'duplicate_registration',
      'event_full',
      'invalid_event_registration',
      'get_public_commerce_settings',
      'grant execute on function public.get_public_commerce_settings() to anon, authenticated, service_role',
      'revoke all on public.commerce_settings from public, anon, authenticated',
      'confirm_paid_event_registrations',
    ])
      expect(sql).toContain(required);
    expect(sql).toContain(
      "fulfillment_type in ('physical','digital_training','event_registration')",
    );
    expect(sql).not.toContain("fulfillment_type in ('physical','digital','event')");
  });
});
