import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');

describe('production deployment hotfixes', () => {
  it('uses the approved Formspree endpoint for contact, newsletter and orders', () => {
    const service = read('src/services/formspree.js');
    const contact = read('src/pages/ContactPage.jsx');
    const newsletter = read('src/components/common/Newsletter.jsx');
    const checkout = read('src/pages/CheckoutPage.jsx');
    expect(service).toContain('https://formspree.io/f/mqerbqvd');
    expect(contact).toContain('sendFormspree');
    expect(newsletter).toContain('sendFormspree');
    expect(checkout).toContain('New LHA order');
    expect(checkout).toContain('orderNumber: confirmedNumber');
  });

  it('shows both physical products and online training in favorites', () => {
    const favorites = read('src/pages/FavoritesPage.jsx');
    expect(favorites).toContain("from '../data/onlineTraining'");
    expect(favorites).toContain('<TrainingCard');
    expect(favorites).toContain('savedCount');
  });

  it('keeps prices and cash checkout functional when cloud commerce settings are unavailable', () => {
    const commerce = read('src/context/CommerceContext.jsx');
    expect(commerce).toContain('SAFE_USD_TO_LYD_FALLBACK = 9');
    expect(commerce).toContain("rateStatus === 'fallback'");
  });

  it('provides a local account fallback when Supabase is not configured', () => {
    const auth = read('src/context/AuthContext.jsx');
    expect(auth).toContain('LOCAL_ACCOUNTS_KEY');
    expect(auth).toContain('localSignUp');
    expect(auth).toContain('configured: true');
  });

  it('contains the mobile filter, colour and RTL containment corrections', () => {
    const css = read('src/styles/global.css');
    expect(css).toContain('.filters-drawer-panel.mobile-filter-sheet');
    expect(css).toContain('.color-dots');
    expect(css).toContain("html[dir='rtl'] #root");
  });
});

it('portals mobile filter and sort sheets to document.body and removes off-screen transforms', () => {
  const shop = read('src/pages/ShopPage.jsx');
  const css = read('src/styles/global.css');
  expect(shop).toContain("import { createPortal } from 'react-dom'");
  expect(shop.match(/createPortal\(/g)?.length).toBe(2);
  expect(shop).toContain('document.body');
  expect(css).toContain('z-index: 2147483000 !important');
  expect(css).toContain('transform: none !important');
});

it('sends order notifications with a reply address and bounded retries', () => {
  const service = read('src/services/formspree.js');
  const checkout = read('src/pages/CheckoutPage.jsx');
  expect(service).toContain('_replyto: customerEmail');
  expect(service).toContain('for (let attempt = 0; attempt < 3; attempt += 1)');
  expect(service).toContain('application/x-www-form-urlencoded');
  expect(service).toContain('toFormBody(body)');
  expect(checkout).toContain("formType: 'order'");
  expect(checkout).toContain('email: payload.customer.email');
  expect(checkout).toContain('message: orderMessage');
  expect(checkout).toContain('displayTotal');
});

it('hard-locks English and Arabic layouts to the viewport without horizontal page movement', () => {
  const css = read('src/styles/global.css');
  expect(css).toContain('overscroll-behavior-x: none');
  expect(css).toContain("html[dir='rtl'] .site-shell");
  expect(css).toContain('overflow-x: hidden !important');
});
