import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import OrderCard from '../src/components/account/OrderCard';

const formatMock = vi.fn((amount, _lang, sourceCurrency) => {
  expect(sourceCurrency).toBe('USD');
  return `${(Number(amount) * 9).toFixed(2)} LYD`;

  it('uses canonical order amounts in the detail page so currency switching never relabels stale values', () => {
    const source = fs.readFileSync('src/pages/OrderDetailPage.jsx', 'utf8');
    expect(source).toContain("format(item.unitPrice, lang, order.currency || 'USD')");
    expect(source).toContain("format(item.lineTotal, lang, order.currency || 'USD')");
    expect(source).toContain("format(order.subtotal, lang, order.currency || 'USD')");
    expect(source).toContain("format(order.shippingTotal, lang, order.currency || 'USD')");
    expect(source).toContain("format(order.total, lang, order.currency || 'USD')");
    expect(source).not.toContain('order.displayTotal ?? order.total');
  });
});

vi.mock('../src/context/CommerceContext', () => ({
  useCommerce: () => ({ format: formatMock }),
}));

vi.mock('../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    lang: 'en',
    pick: ({ en }) => en,
  }),
}));

vi.mock('../src/services/orderStatus', () => ({
  presentOrderStatus: (_kind, status) => ({ label: status, category: 'neutral' }),
}));

describe('order tracking currency display', () => {
  it('renders tracking totals from canonical USD using the current commerce formatter', () => {
    render(
      <MemoryRouter>
        <OrderCard
          order={{
            orderNumber: 'LHA-TEST',
            createdAt: '2026-07-20T00:00:00.000Z',
            orderStatus: 'received',
            paymentStatus: 'pending',
            syncState: 'local-only',
            currency: 'USD',
            displayCurrency: 'LYD',
            total: 46.22,
            displayTotal: 46.22,
            items: [{ id: 'p1', quantity: 1, name: 'Game Day Shorts' }],
          }}
        />
      </MemoryRouter>,
    );

    expect(formatMock).toHaveBeenCalledWith(46.22, 'en', 'USD');
    expect(screen.getByText('415.98 LYD')).toBeInTheDocument();
    expect(screen.queryByText('46.22 LYD')).not.toBeInTheDocument();
  });

  it('uses canonical order amounts in the detail page so currency switching never relabels stale values', () => {
    const source = fs.readFileSync('src/pages/OrderDetailPage.jsx', 'utf8');
    expect(source).toContain("format(item.unitPrice, lang, order.currency || 'USD')");
    expect(source).toContain("format(item.lineTotal, lang, order.currency || 'USD')");
    expect(source).toContain("format(order.subtotal, lang, order.currency || 'USD')");
    expect(source).toContain("format(order.shippingTotal, lang, order.currency || 'USD')");
    expect(source).toContain("format(order.total, lang, order.currency || 'USD')");
    expect(source).not.toContain('order.displayTotal ?? order.total');
  });
});
