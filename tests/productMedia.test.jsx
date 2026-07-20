import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '../src/context/LanguageContext';
import SmartImage from '../src/components/common/SmartImage';
import { products } from '../src/data/products';

describe('product media integrity', () => {
  it('never uses the same source for primary and hover media', () => {
    for (const product of products) {
      if (product.hoverImage) expect(product.hoverImage).not.toBe(product.image);
    }
  });

  it('keeps supplied media mapped to the matching garment type', () => {
    const tee = products.find((product) => product.id === 'p001');
    const longSleeve = products.find((product) => product.id === 'p002');
    expect(tee.name.en).toBe('Hoopers Tee');
    expect(tee.image).toContain('hoopers-tee-black');
    expect(tee.hoverImage).toBeNull();
    expect(longSleeve.productType).toBe('Long Sleeve Top');
    expect(longSleeve.image).toContain('hoopers-long-sleeve-grey');
  });

  it('marks products without supplied photography as intentionally missing', () => {
    const missing = products.filter((product) => !product.image);
    expect(missing.length).toBeGreaterThan(0);
    expect(missing.every((product) => product.mediaStatus === 'missing')).toBe(true);
  });
});

describe('SmartImage fallback', () => {
  it('renders an accessible branded missing-media state rather than unrelated imagery', () => {
    render(
      <LanguageProvider>
        <SmartImage src={null} alt="Elite Hoodie" />
      </LanguageProvider>,
    );
    expect(screen.getByRole('img', { name: 'Elite Hoodie' })).toHaveTextContent(
      'Media coming soon',
    );
  });
});
