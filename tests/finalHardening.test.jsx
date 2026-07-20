import { describe, expect, it, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { getSearchSuggestions, POPULAR_SEARCHES, SEARCH_PAGES } from '../src/utils/search';
import { presentOrderStatus } from '../src/services/orderStatus';
import {
  normalizeOrder,
  readLocalOrders,
  writeLocalOrders,
  createIdempotencyKey,
} from '../src/services/orders';
import { HELP_TOPICS } from '../src/pages/HelpPage';

describe('final hardening invariants', () => {
  beforeEach(() => localStorage.clear());

  it('removes the duplicate footer element and legacy mobile trigger from source', () => {
    const footer = readFileSync('src/components/layout/Footer.jsx', 'utf8');
    const header = readFileSync('src/components/layout/Header.jsx', 'utf8');
    expect(footer).not.toContain('footer-brand-mark--removed');
    expect(footer).not.toContain('SITE.logoLight');
    expect(header.match(/ref=\{menuButton\}/g)).toHaveLength(1);
    expect(header.match(/mobile-more-action/g)).toHaveLength(1);
    expect(header).not.toContain('className="menu-btn icon-btn"');
  });

  it('keeps one account quick action in the menu', () => {
    const header = readFileSync('src/components/layout/Header.jsx', 'utf8');
    const quick = header.slice(
      header.indexOf('mobile-quick-actions'),
      header.indexOf('mobile-primary-nav'),
    );
    expect(quick.match(/to="\/account"/g)).toHaveLength(1);
  });

  it('ranks exact and prefix search matches deterministically without duplicate IDs', () => {
    const exact = getSearchSuggestions('Programs', 20);
    expect(exact[0].label.en).toBe('Programs');
    const prefix = getSearchSuggestions('hoo', 20);
    expect(new Set(prefix.map((item) => item.id)).size).toBe(prefix.length);
    expect(getSearchSuggestions('hoo', 20).map((item) => item.id)).toEqual(
      prefix.map((item) => item.id),
    );
  });

  it('validates popular discovery routes and bilingual labels', () => {
    const known = new Set([
      ...SEARCH_PAGES.map((page) => page.to),
      '/shop/t-shirts',
      '/shop/hoodies',
      '/shop/shorts',
    ]);
    for (const item of POPULAR_SEARCHES) {
      expect(item.query.en).toBeTruthy();
      expect(item.query.ar).toBeTruthy();
      expect(known.has(item.to)).toBe(true);
    }
  });

  it('uses explicit bilingual help labels and section-specific content', () => {
    expect(HELP_TOPICS).toHaveLength(8);
    const summaries = new Set(HELP_TOPICS.map((topic) => topic.summary.en));
    expect(summaries.size).toBe(HELP_TOPICS.length);
    HELP_TOPICS.forEach((topic) =>
      topic.links.forEach((link) => {
        expect(link.label.en).toBeTruthy();
        expect(link.label.ar).toBeTruthy();
        expect(link.label.en).not.toMatch(/^\//);
      }),
    );
  });

  it('translates known and safely falls back for unknown order statuses', () => {
    expect(presentOrderStatus('payment', 'paid', 'en').label).toBe('Paid');
    expect(presentOrderStatus('order', 'received', 'ar').label).toBe('تم استلام الطلب');
    expect(presentOrderStatus('order', 'mystery', 'en')).toMatchObject({
      known: false,
      category: 'neutral',
    });
  });

  it('migrates and safely handles corrupted local order storage', () => {
    localStorage.setItem(
      'lha-orders-v2',
      JSON.stringify([
        {
          orderNumber: 'LHA-1',
          email: 'A@B.COM',
          items: [{ name: 'Tee', quantity: 1, price: 10 }],
          total: 10,
        },
      ]),
    );
    expect(readLocalOrders().orders[0]).toMatchObject({
      orderNumber: 'LHA-1',
      email: 'a@b.com',
      schemaVersion: 3,
    });
    localStorage.setItem('lha-orders-v3', '{broken');
    expect(readLocalOrders()).toMatchObject({ orders: [] });
    expect(readLocalOrders().error).toBeInstanceOf(Error);
  });

  it('normalizes quantities, totals and unique idempotency keys', () => {
    const one = createIdempotencyKey();
    const two = createIdempotencyKey();
    expect(one).not.toBe(two);
    const order = normalizeOrder({
      orderNumber: 'X',
      email: 'X@Y.COM',
      total: -4,
      items: [{ name: 'Item', quantity: 0, price: -2 }],
    });
    expect(order.total).toBe(0);
    expect(order.items[0]).toMatchObject({ quantity: 1, unitPrice: 0, lineTotal: 0 });
    expect(writeLocalOrders([order]).ok).toBe(true);
  });
});
