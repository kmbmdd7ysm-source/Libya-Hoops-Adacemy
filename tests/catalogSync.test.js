import { describe, expect, it } from 'vitest';
import { buildCatalog } from '../scripts/catalog/build-catalog.mjs';
import { products } from '../src/data/products';
describe('trusted catalog generation', () => {
  it('is deterministic, complete and uses stable variant identifiers', () => {
    const first = buildCatalog(products);
    const second = buildCatalog(products);
    expect(first).toEqual(second);
    expect(first.length).toBeGreaterThan(0);
    expect(new Set(first.map((x) => x.variant_id)).size).toBe(first.length);
    expect(
      first.every((x) => x.variant_id === `${x.product_id}:${x.sku}` && x.unit_price >= 0),
    ).toBe(true);
  });
  it('rejects invalid authoritative records', () => {
    expect(() =>
      buildCatalog([{ id: 'x', slug: 'x', sku: 'x', currency: 'USD', price: -1, variants: [] }]),
    ).toThrow(/price/i);
    expect(() =>
      buildCatalog([{ id: 'x', slug: 'x', sku: 'x', currency: 'EUR', price: 1, variants: [] }]),
    ).toThrow(/currency/i);
  });
});

describe('catalog inventory policy', () => {
  const base = {
    id: 'inventory-test',
    slug: 'inventory-test',
    sku: 'INV',
    name: { en: 'Inventory Test' },
    currency: 'USD',
    price: 10,
    availability: 'in-stock',
    lowStockThreshold: 2,
  };

  it('requires integer stock for tracked variants', () => {
    expect(() =>
      buildCatalog([{ ...base, variants: [{ sku: 'INV-TRACKED', stock: null }] }]),
    ).toThrow(/tracked variant requires integer stock/i);
  });

  it('emits an explicit unlimited policy without a quantity', () => {
    const [row] = buildCatalog([
      {
        ...base,
        inventoryTracking: false,
        variants: [{ sku: 'INV-UNLIMITED', stock: null }],
      },
    ]);
    expect(row.inventory_tracking).toBe(false);
    expect(row.inventory_quantity).toBeNull();
  });
});
