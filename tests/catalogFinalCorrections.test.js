import { describe, expect, it } from 'vitest';
import { products } from '../src/data/products';
import { convertPrice, formatMoney } from '../src/services/money';

describe('final catalogue corrections', () => {
  it('marks both backpack families as coming soon without a price', () => {
    for (const id of ['p027', 'p028']) {
      const product = products.find((item) => item.id === id);
      expect(product.comingSoon).toBe(true);
      expect(product.available).toBe(false);
      expect(product.price).toBe(0);
    }
  });
  it('uses supplied black and white sock images', () => {
    const socks = products.find((item) => item.id === 'p031');
    expect(socks.colors.map((color) => color.image)).toEqual([
      '/images/products/lha-court-socks-black.jpeg',
      '/images/products/lha-court-socks-white.jpeg',
    ]);
  });
  it('rounds LYD upward to the next five and removes decimals', () => {
    expect(convertPrice(16, 'USD', 'LYD', 9)).toBe(145);
    expect(convertPrice(17, 'USD', 'LYD', 9)).toBe(155);
    expect(convertPrice(22, 'USD', 'LYD', 9)).toBe(200);
    expect(formatMoney(153, 'LYD', 'en')).toContain('155 LYD');
  });
});
