// ============================================================================
// STATIC PAGE PRE-RENDER (SEO) — runs after `vite build`.
// ----------------------------------------------------------------------------
// This is a SPA, so crawlers that don't execute JS would otherwise see the same
// generic <head> on every URL. This script clones dist/index.html for each
// route and injects a route-specific <title>, description, canonical and Open
// Graph tags. React still hydrates and takes over on load; this only improves
// what non-JS crawlers and link unfurlers see first.
// ============================================================================

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE } from '../src/config.js';
import { products } from '../src/data/products.js';
import { programs } from '../src/data/programs.js';
import { onlineTraining } from '../src/data/onlineTraining.js';
import { events } from '../src/data/events.js';
import { legal } from '../src/data/legal.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const INDEX = join(DIST, 'index.html');

if (!existsSync(INDEX)) {
  console.error('✗ dist/index.html not found — run "vite build" first.');
  process.exit(1);
}

const template = await readFile(INDEX, 'utf8');
const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
const en = (v) => (v && typeof v === 'object' ? (v.en ?? '') : (v ?? ''));
const ABS = (p) => `${SITE.domain}${p === '/' ? '' : p}`;
const OG = SITE.defaultOg.startsWith('http') ? SITE.defaultOg : `${SITE.domain}${SITE.defaultOg}`;

function render(route) {
  const title = route.title.includes(SITE.name) ? route.title : `${route.title} | ${SITE.name}`;
  const url = ABS(route.path);
  const image = route.image
    ? route.image.startsWith('http')
      ? route.image
      : `${SITE.domain}${route.image}`
    : OG;
  const desc = esc(route.description || '');
  let html = template;

  // <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
  // description
  html = html.replace(
    /<meta\s+name="description"[^>]*>/i,
    `<meta name="description" content="${desc}">`,
  );
  // canonical
  if (/rel="canonical"/i.test(html))
    html = html.replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${url}">`);
  else html = html.replace('</head>', `  <link rel="canonical" href="${url}">\n</head>`);

  // Open Graph / Twitter — replace if present, else inject
  const set = (attr, key, value) => {
    const re = new RegExp(`<meta\\s+${attr}="${key}"[^>]*>`, 'i');
    const tag = `<meta ${attr}="${key}" content="${value}">`;
    html = re.test(html) ? html.replace(re, tag) : html.replace('</head>', `  ${tag}\n</head>`);
  };
  set('property', 'og:title', esc(title));
  set('property', 'og:description', desc);
  set('property', 'og:url', url);
  set('property', 'og:image', esc(image));
  set('property', 'og:type', route.type || 'website');
  set('name', 'twitter:title', esc(title));
  set('name', 'twitter:description', desc);
  set('name', 'twitter:image', esc(image));

  return html;
}

async function emit(route) {
  const html = render(route);
  // cleanUrls: write /path/index.html (root stays dist/index.html)
  const outDir = route.path === '/' ? DIST : join(DIST, route.path);
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, 'index.html'), html, 'utf8');
}

// ---- Static routes ----
const routes = [
  {
    path: '/',
    title: `${SITE.name} — ${en(SITE.slogan)}`,
    description: 'Basketball academy, programs, events and premium gear. Own the game.',
  },
  {
    path: '/about',
    title: 'About',
    description: 'Who we are and how Libya Hoops Academy develops players on and off the court.',
  },
  {
    path: '/shop',
    title: 'Shop',
    description: 'Premium basketball apparel and accessories built for the game.',
  },
  {
    path: '/programs',
    title: 'Programs',
    description: 'In-person basketball training programs for every level.',
  },
  { path: '/events', title: 'Events', description: 'Upcoming camps, clinics and tournaments.' },
  {
    path: '/online-training',
    title: 'Online Training',
    description: 'Structured digital basketball training you can follow anywhere.',
  },
  {
    path: '/coaches',
    title: 'Coaches',
    description: 'Meet the coaching staff behind Libya Hoops Academy.',
  },
  { path: '/contact', title: 'Contact', description: 'Get in touch with Libya Hoops Academy.' },
  {
    path: '/help',
    title: 'Help',
    description: 'Support for orders, shopping, programs and accounts.',
  },
  {
    path: '/faq',
    title: 'FAQ',
    description: 'Answers to common questions about programs, orders and events.',
  },
  {
    path: '/size-guide',
    title: 'Size Guide',
    description: 'Measurements and fit guidance for Libya Hoops Academy apparel.',
  },
  {
    path: '/order-tracking',
    title: 'Order Tracking',
    description: 'Look up the status of your order.',
  },
  {
    path: '/orders',
    title: 'Orders',
    description: 'Review recent orders from your Libya Hoops Academy account.',
  },
];

// ---- Legal ----
for (const key of Object.keys(legal)) {
  routes.push({ path: `/${key}`, title: en(legal[key].title), description: en(legal[key].intro) });
}

// ---- Dynamic detail pages ----
for (const p of products)
  routes.push({
    path: `/products/${p.slug}`,
    title: en(p.seoTitle) || en(p.name),
    description: en(p.seoDescription) || en(p.description),
    image: p.socialImage || p.image,
    type: 'product',
  });
for (const p of programs.filter((x) => x.enabled))
  routes.push({
    path: `/programs/${p.slug}`,
    title: en(p.name),
    description: en(p.summary),
    image: p.image,
  });
for (const t of onlineTraining)
  routes.push({
    path: `/online-training/${t.slug}`,
    title: en(t.title),
    description: en(t.description),
    image: t.coverImage,
  });
for (const e of events)
  routes.push({
    path: `/events/${e.slug}`,
    title: en(e.title),
    description: en(e.description),
    image: e.coverImage,
    type: 'article',
  });

let count = 0;
for (const route of routes) {
  await emit(route);
  count++;
}

console.log(`\n✓ Pre-rendered ${count} static HTML pages into dist/.\n`);
