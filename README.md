# Libya Hoops Academy (LHA)

Bilingual (English / Arabic + RTL) basketball academy and lifestyle-commerce website.

**Slogan:** Own The Game. / امتلك اللعبة.

Built with React 18, Vite 7, React Router v6 and react-helmet-async. Every page is a real route with its own URL, title, description and structured data — direct links and refreshes work.

---

## 1. Requirements

| Tool    | Version                                      |
| ------- | -------------------------------------------- |
| Node.js | **>= 18.18.0** (20 LTS or newer recommended) |
| npm     | **>= 9**                                     |

## 2. Install & run

```bash
npm install        # install dependencies
npm run dev        # start dev server → http://localhost:5173
npm run build      # validate data → production build → pre-render SEO pages
npm run preview    # preview the production build locally
```

| Script             | What it does                                                                       |
| ------------------ | ---------------------------------------------------------------------------------- |
| `dev`              | Vite dev server with hot reload                                                    |
| `validate:data`    | Checks content data (ids, slugs, bilingual fields, prices, stock). Fails on error. |
| `build`            | Runs `validate:data`, then `vite build`, then `generate-static-pages.mjs`          |
| `preview`          | Serves `dist/` locally                                                             |
| `audit:production` | `npm audit --omit=dev`                                                             |

`npm run build` **fails on purpose** if content data is malformed, so broken data can never reach production.

---

## 3. Environment variables

Copy `.env.example` to `.env` and fill in only what you need. **Everything is optional** — the site runs fully without any of them, and hides/disables the related feature instead of faking it.

| Variable                      | Purpose                                         | If left blank                                                               |
| ----------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------- |
| `VITE_GA_MEASUREMENT_ID`      | Google Analytics 4 Measurement ID               | Analytics never loads at all                                                |
| `VITE_FORM_ENDPOINT`          | Contact form endpoint (Formspree or compatible) | Form validates and acknowledges, but does not claim it was sent to a server |
| `VITE_NEWSLETTER_ENDPOINT`    | Newsletter signup endpoint                      | Same as above                                                               |
| `VITE_PAYMENTS_PROVIDER`      | e.g. `stripe`                                   | Checkout shows a clear "contact us to order" notice                         |
| `VITE_STRIPE_PUBLISHABLE_KEY` | **Publishable** key only (safe in the browser)  | As above                                                                    |
| `VITE_CHECKOUT_API_BASE`      | Base URL of your server-side checkout API       | As above                                                                    |

> **Never put a secret key in this project.** Anything starting with `VITE_` is bundled into the browser and is publicly visible. Secret keys belong only on your server.

---

## 4. Project structure

```
lha/
├── index.html                  # HTML shell, fonts, base meta
├── vercel.json                 # SPA rewrites, clean URLs, security headers, caching
├── vite.config.js
├── .env.example
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   ├── sitemap.xml             # ← update when you add pages
│   ├── site.webmanifest
│   └── images/brand/           # logo, wordmark, OG image
├── scripts/
│   ├── validate-data.mjs       # pre-build content validation
│   └── generate-static-pages.mjs  # post-build per-route SEO HTML
└── src/
    ├── config.js               # ★ brand, contact, social, currency, shipping
    ├── App.jsx                 # routes
    ├── main.jsx
    ├── context/                # LanguageContext, CartContext, CookieContext
    ├── hooks/                  # usePageTracking, useRecentlyViewed, useWishlist
    ├── utils/                  # format, analytics, payments, search, share
    ├── data/                   # ★ ALL editable content lives here
    │   ├── translations.js     # every UI string (EN + AR)
    │   ├── products.js         # shop items + variants + inventory
    │   ├── categories.js
    │   ├── programs.js         # in-person programs (inquiry only)
    │   ├── onlineTraining.js   # digital products (purchasable)
    │   ├── events.js
    │   ├── coaches.js          # EMPTY by design — add real coaches only
    │   ├── faqs.js
    │   ├── legal.js
    │   ├── sizeGuide.js
    │   ├── navigation.js
    │   └── announcements.js
    ├── components/
    │   ├── common/  layout/  shop/  programs/  events/  training/  coaches/
    ├── pages/                  # 22 route components
    └── styles/global.css       # design tokens + all component styles
```

★ = the files you'll edit most.

---

## 5. Official brand assets

The accepted Libya Hoops Academy logo, wordmark, favicon and social-sharing artwork are already installed at the stable paths defined in `src/config.js`. Preserve the existing artwork and filenames unless a verified production defect requires a minimal correction.

The production Open Graph image is `public/images/brand/og-image.png` and is validated at exactly 1200 × 630 pixels.

---

## 6. Editing content

### 6.1 Brand, contact details and social links — `src/config.js`

Official email and social destinations live in `src/config.js`. Optional phone, WhatsApp, address and hours remain empty and are hidden safely until real values are supplied.

```js
email: 'Libyahoopsacademy@gmail.com',
emailLink: 'mailto:Libyahoopsacademy@gmail.com',
phone: '',
whatsapp: '',
address: { en: '', ar: '' },
hours: { en: '', ar: '' },
social: { instagram: 'https://www.instagram.com/libyahoopsacademy', /* ... */ }
```

Also here: `domain`, currency display settings and `legalUpdated`. Country shipping rates are centralized in `src/config/shipping.js`.

### 6.2 The bilingual rule

Every piece of visible content is an object with `en` and `ar` keys:

```js
name: { en: 'Core Tee', ar: 'تي شيرت أساسي' }
```

**Lists** are a single object holding two arrays (**not** an array of objects):

```js
features: {
  en: ['Ribbed crew neck', 'Reinforced shoulder seams'],
  ar: ['ياقة مضلعة', 'حياكة أكتاف مقواة']
}
```

Both `en` and `ar` are required — `npm run build` fails if one is missing.

### 6.3 Products — `src/data/products.js`

Variants and inventory are generated automatically from `sizes` × `colors` by the product factory, so you only declare the parts that change:

```js
{
  id: 'p014',                              // unique
  slug: 'new-product',                     // unique, lowercase-with-dashes → /products/new-product
  sku: 'LHA-NEW',
  name: { en: '', ar: '' },
  description: { en: '', ar: '' },
  category: 'apparel',                     // must match a slug in categories.js
  subcategory: 'tees',
  price: 45,
  compareAt: null,                         // set a higher number to show a sale price
  sizes: ['XS','S','M','L','XL'],          // use ['OS'] for one-size items
  colors: [{ key: 'black', name: { en: 'Black', ar: 'أسود' }, hex: '#111111' }],
  stockPerVariant: 12,                     // → per size/colour stock + SKUs
  availability: 'in-stock',                // or 'sold-out'
  image: '/images/products/new-product.jpg',
  alt: { en: '', ar: '' },
  features: { en: [], ar: [] },
  sizeGuide: 'tops',                       // key from sizeGuide.js (optional)
  featured: false, newArrival: true, bestSeller: false
}
```

- **Stock:** change `stockPerVariant`, or set exact per-variant stock in `stockPerVariant` as a map if you need different numbers per size.
- **Sold out:** set `availability: 'sold-out'` (product `p013` is intentionally sold out as a working example).
- **Categories/subcategories:** edit `src/data/categories.js`. Category slugs drive the URLs `/shop/:category/:subcategory`.

### 6.4 Programs — `src/data/programs.js`

In-person programs are **inquiry-only** (`price: null`, `inquiryOnly: true`) — they are never added to the cart; the CTA opens the contact form pre-filled with the program. Set `enabled: false` to hide one without deleting it.

### 6.5 Online training — `src/data/onlineTraining.js`

Digital products **are** purchasable. Set `available: false` to show "Coming soon" instead of an add-to-cart button. `curriculum` is a real array of modules; each module's `lessons` is `{ en: [], ar: [] }`.

### 6.6 Events — `src/data/events.js`

```js
status: 'open',            // 'open' | 'full' | 'ended'
startDate: '2026-08-01',   // YYYY-MM-DD (required format)
registrationDeadline: '2026-07-25',
capacity: 40,
remaining: 12,             // registration closes automatically at 0
price: 120,                // 0 = free
```

Registration is gated automatically: past events, full events and passed deadlines all show the correct state instead of a broken button.

### 6.7 Coaches — `src/data/coaches.js`

**Starts empty on purpose.** The site never invents staff — the coaches page and homepage show a tidy empty state until you add real people. A fully documented template with every field is in the file: copy it into the `coaches` array and fill it in. Optional fields left as `''` or `[]` hide themselves automatically.

### 6.8 Translations — `src/data/translations.js`

All UI strings, in 25 namespaces (`nav`, `common`, `home`, `shop`, `product`, `cart`, `checkout`, …). Add a key to **both** `en` and `ar`. Access in components via `const { t } = useLanguage()` → `t.shop.title`.

Content from `data/` is localised with `pick()`:

```js
const { t, pick, lang } = useLanguage();
pick(product.name); // → localized string
pick(product.features); // → localized array
```

---

## 7. Connecting forms, newsletter and analytics

### Contact form + newsletter

Set `VITE_FORM_ENDPOINT` / `VITE_NEWSLETTER_ENDPOINT` to any endpoint that accepts a JSON `POST` (Formspree, Basin, your own API). The form posts JSON and reports the real result. Without an endpoint it validates and acknowledges without pretending a message was delivered.

If you use a provider other than Formspree, update `connect-src` and `form-action` in `vercel.json`'s Content-Security-Policy.

### Google Analytics 4

Set `VITE_GA_MEASUREMENT_ID`. **Analytics only loads after the visitor accepts analytics cookies** in the banner — no tracking scripts run before consent, and rejecting/withdrawing consent disables it. Leave blank to remove analytics entirely.

---

## 8. Payments — how to switch checkout on

**This project never fakes a payment.** With no provider configured, checkout shows a clear "contact us to order" notice and the pay button stays disabled. There is no simulated success screen.

The frontend never sees a secret key. Flow:

1. Browser `POST`s the cart to `${VITE_CHECKOUT_API_BASE}/create-session`
2. **Your server** re-validates prices and totals using your secret key, then creates a hosted checkout session
3. Server returns `{ url: 'https://checkout.stripe.com/...' }`
4. Browser redirects to that secure hosted page
5. Provider redirects back to `/checkout/success` or `/checkout/cancelled`

### Step 1 — environment

```bash
VITE_PAYMENTS_PROVIDER=stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx      # publishable = safe in browser
VITE_CHECKOUT_API_BASE=https://your-site.vercel.app/api
```

### Step 2 — server endpoint (example: `api/create-session.js` on Vercel)

```js
// Runs on the SERVER. STRIPE_SECRET_KEY is a Vercel env var — never VITE_ prefixed.
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { items, customer, locale } = req.body;

  // ⚠️ Re-price every line item from YOUR OWN source of truth.
  // Never trust prices sent by the browser.
  const line_items = items.map((i) => ({
    price_data: {
      currency: 'usd',
      product_data: { name: i.name },
      unit_amount: lookupPriceInCents(i.id, i.sku), // your server-side lookup
    },
    quantity: i.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items,
    customer_email: customer?.email,
    locale,
    success_url: `${process.env.SITE_URL}/checkout/success?ref={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.SITE_URL}/checkout/cancelled`,
  });

  res.status(200).json({ url: session.url });
}
```

Set `STRIPE_SECRET_KEY` and `SITE_URL` in your hosting dashboard (Vercel → Settings → Environment Variables). **Never** prefix a secret with `VITE_`.

### Express wallets (Apple Pay / Google Pay)

The checkout detects wallets available in the visitor's browser and shows them only when payments are configured **and** the wallet is genuinely available. They need a **real merchant account** with your provider plus domain verification (Apple Pay requires hosting a verification file). Until that's done, no wallet buttons appear — nothing is faked.

### Order tracking

`/order-tracking` is honest by design: it states clearly that live carrier tracking isn't connected and points to the contact form. Wire it to your fulfilment provider when you have one.

---

## 9. Deploying to Vercel

1. Push the repo to GitHub/GitLab.
2. Vercel → **New Project** → import the repo.
3. Framework preset: **Vite**. Build command `npm run build`, output directory `dist`. (Both auto-detected.)
4. Add your environment variables under **Settings → Environment Variables**.
5. Deploy, then add your custom domain and update `SITE.domain` in `src/config.js`.

`vercel.json` already configures:

- **SPA rewrites** — every route falls back to `index.html`, so `/products/core-tee` works on direct load and refresh
- **Clean URLs**, no trailing slashes
- **Security headers** — CSP, HSTS, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
- **Caching** — immutable hashed assets, sensible image caching

Any static host works, as long as you add an SPA fallback rewrite to `index.html`.

### Routing & pre-rendering, briefly

This is a single-page app: React Router handles navigation client-side, and `react-helmet-async` sets per-route `<title>`, description, canonical, Open Graph and JSON-LD. Because a crawler that doesn't run JavaScript would otherwise see the same shell everywhere, `scripts/generate-static-pages.mjs` runs after the build and writes a real `dist/<route>/index.html` for every static, legal, product, program, training and event page with that route's meta already baked in. React then hydrates and takes over.

---

## 10. SEO checklist

- **`public/sitemap.xml`** — static, so update it when you add or remove products, events, programs or training. Then resubmit in Google Search Console.
- **`public/robots.txt`** — update the `Sitemap:` line to your real domain.
- `/cart`, `/checkout`, `/search` and `/order-tracking` are `noindex` by design.
- Structured data included: `SportsOrganization`, `WebSite`, `Product` + `Offer`, `Course`, `Event`, `Person`, `FAQPage`, `BreadcrumbList`, `CollectionPage`.

---

## 11. Pre-launch checklist

**Content**

- [x] Official logo, wordmark and favicon are installed
- [x] `og-image.png` is present and validated at 1200 × 630
- [x] Official email and social links are centralized in `src/config.js`
- [ ] Set `SITE.domain` to the real domain
- [ ] Add real coaches (or leave empty — the empty state is intentional)
- [ ] Replace demo products/events/programs with real ones; add product images
- [ ] Review legal pages in `src/data/legal.js` **with a lawyer** and update `legalUpdated`
- [ ] Update `public/sitemap.xml` and `robots.txt`

**Configuration**

- [ ] `npm run build` passes with no errors
- [ ] Environment variables set in the hosting dashboard
- [ ] Contact form endpoint tested end-to-end
- [ ] If selling: server `/create-session` endpoint deployed, secret key **server-side only**, one real test transaction completed

**Testing**

- [ ] Every route loads on direct URL entry **and** on refresh (not just via in-app links)
- [ ] Language toggle works on every page; Arabic layout mirrors correctly (RTL)
- [ ] Add to cart → cart → checkout works; digital-only carts hide shipping fields
- [ ] Sold-out product blocks add-to-cart; size/colour must be chosen before adding
- [ ] Filters and sort survive a refresh (state lives in the URL)
- [ ] 404 page appears for an unknown URL and an unknown product slug
- [ ] Cookie banner: accept, reject and change-preferences all behave; analytics only fires after consent
- [ ] Mobile (360px), tablet and desktop all check out
- [ ] Keyboard-only navigation: skip link, focus rings, menus and modals close on Escape
- [ ] Lighthouse pass (performance, accessibility, best practices, SEO)

---

## 12. Design notes

Light, premium identity: white background, near-black text, soft-grey borders, a single sparing red accent (`#e4002b`). Primary buttons are solid black; secondary are white with a black border. Type is Archivo (display, uppercase) + Inter (body), with Noto Kufi Arabic for Arabic.

All design tokens are CSS custom properties at the top of `src/styles/global.css` — change the palette, radii, shadows or fonts there and it propagates site-wide.
