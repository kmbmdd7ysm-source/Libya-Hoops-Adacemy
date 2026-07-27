import { describe, expect, it } from 'vitest';
import { products, getProduct } from '../src/data/products';
import { hasCountryPreference, hasCurrencyPreference } from '../src/services/commercePreferences';

describe('final launch catalogue and preferences', () => {
  it('adds the zip hoodie and crewneck with three colour variants', () => {
    for (const slug of ['own-the-game-zip-hoodie', 'own-the-game-crewneck']) {
      const product = getProduct(slug);
      expect(product).toBeTruthy();
      expect(product.colors).toHaveLength(3);
      expect(product.colors.every((colour) => colour.image)).toBe(true);
    }
  });

  it('places the requested performance products in compression', () => {
    for (const slug of [
      'lha-sleeve-logo-performance-tee',
      'lha-chest-logo-tank',
      'lha-center-logo-tank',
    ]) {
      expect(getProduct(slug)?.subcategory).toBe('compression');
    }
  });

  it('keeps product ids and slugs unique', () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
  });

  it('detects absence of stored geo preferences', () => {
    localStorage.clear();
    expect(hasCountryPreference(null)).toBe(false);
    expect(hasCurrencyPreference(null)).toBe(false);
  });
});
