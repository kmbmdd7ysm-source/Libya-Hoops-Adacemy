import { describe, expect, it } from 'vitest';
import { getProduct } from '../src/data/products';
import { getSubcategory } from '../src/data/categories';
import { megaMenu, footerNav } from '../src/data/navigation';

describe('premium fleece set catalogue entry', () => {
  it('provides one bilingual product with three colour variants and complete inventory', () => {
    const product = getProduct('lha-premium-fleece-set');
    expect(product).toBeTruthy();
    expect(product.name.en).toBe('LHA Premium Fleece Set');
    expect(product.name.ar).toBe('طقم LHA فليس فاخر');
    expect(product.category).toBe('clothing');
    expect(product.subcategory).toBe('fleece-sets');
    expect(product.colors.map((color) => color.key)).toEqual(['black', 'grey', 'cream']);
    expect(product.sizes).toEqual(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
    expect(product.variants).toHaveLength(18);
    expect(product.colors.every((color) => color.image)).toBe(true);
  });
});

describe('accessories navigation taxonomy', () => {
  const expected = ['socks', 'balls', 'hats', 'towels', 'sleeves-and-armbands'];
  it.each(expected)('exposes %s in bilingual category data', (slug) => {
    const item = getSubcategory('accessories', slug);
    expect(item?.name.en).toBeTruthy();
    expect(item?.name.ar).toBeTruthy();
  });

  it('links every new accessories option in the mega menu and footer', () => {
    const accessories = megaMenu.columns.find((column) => column.title.en === 'Accessories');
    for (const slug of expected) {
      expect(accessories.links.some((link) => link.to === `/shop/accessories/${slug}`)).toBe(true);
      expect(footerNav.shop.some((link) => link.to === `/shop/accessories/${slug}`)).toBe(true);
    }
  });
});
