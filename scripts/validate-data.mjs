// ============================================================================
// DATA VALIDATION — runs before every production build (npm run build).
// Fails the build (exit 1) if content data is malformed, so broken data never
// ships. Checks unique ids/slugs and required bilingual ({ en, ar }) fields.
// ============================================================================

import { products } from '../src/data/products.js';
import { events } from '../src/data/events.js';
import { programs } from '../src/data/programs.js';
import { onlineTraining } from '../src/data/onlineTraining.js';
import { categories } from '../src/data/categories.js';

let errors = 0;
let warnings = 0;
const err = (msg) => {
  console.error(`  ✗ ${msg}`);
  errors++;
};
const warn = (msg) => {
  console.warn(`  ! ${msg}`);
  warnings++;
};

const isBilingual = (v) =>
  v &&
  typeof v === 'object' &&
  typeof v.en === 'string' &&
  v.en.trim() &&
  typeof v.ar === 'string' &&
  v.ar.trim();

function checkUnique(list, label) {
  const ids = new Set();
  const slugs = new Set();
  for (const item of list) {
    if (!item.id) err(`${label}: an item is missing an "id"`);
    else if (ids.has(item.id)) err(`${label}: duplicate id "${item.id}"`);
    else ids.add(item.id);

    if (!item.slug) err(`${label}: "${item.id}" is missing a "slug"`);
    else if (slugs.has(item.slug)) err(`${label}: duplicate slug "${item.slug}"`);
    else if (!/^[a-z0-9-]+$/.test(item.slug))
      err(`${label}: slug "${item.slug}" must be lowercase letters, numbers and hyphens only`);
    else slugs.add(item.slug);
  }
}

function checkFields(list, label, biFields, nameField) {
  for (const item of list) {
    for (const f of biFields) {
      if (!isBilingual(item[f]))
        err(`${label} "${item.id || item.slug}": field "${f}" must have non-empty { en, ar }`);
    }
    if (nameField && item[nameField] == null) warn(`${label} "${item.id}": missing "${nameField}"`);
  }
}

console.log('\nValidating content data...\n');

console.log('Products:');
checkUnique(products, 'products');
checkFields(products, 'product', ['name', 'description', 'alt']);
for (const p of products) {
  if (typeof p.price !== 'number' || p.price < 0)
    err(`product "${p.id}": price must be a non-negative number`);
  if (!Array.isArray(p.variants) || p.variants.length === 0)
    err(`product "${p.id}": must have at least one variant`);
  const skus = new Set();
  for (const v of p.variants || []) {
    if (!v.sku) err(`product "${p.id}": a variant is missing a sku`);
    else if (skus.has(v.sku)) err(`product "${p.id}": duplicate variant sku "${v.sku}"`);
    else skus.add(v.sku);
    if (typeof v.stock !== 'number')
      err(`product "${p.id}": variant "${v.sku}" stock must be a number`);
  }
  if (!['in-stock', 'sold-out'].includes(p.availability))
    warn(`product "${p.id}": unusual availability "${p.availability}"`);
}

console.log('Programs:');
checkUnique(programs, 'programs');
checkFields(programs, 'program', ['name', 'summary', 'description']);

console.log('Online training:');
checkUnique(onlineTraining, 'onlineTraining');
checkFields(onlineTraining, 'training', ['title', 'description']);
for (const t of onlineTraining) {
  if (t.available !== false && (typeof t.price !== 'number' || t.price < 0))
    err(`training "${t.id}": purchasable items need a non-negative numeric price`);
}

console.log('Events:');
checkUnique(events, 'events');
checkFields(events, 'event', ['title', 'description', 'venue']);
for (const e of events) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.startDate || ''))
    err(`event "${e.id}": startDate must be YYYY-MM-DD`);
  if (typeof e.remaining !== 'number') err(`event "${e.id}": remaining must be a number`);
}

console.log('Categories:');
for (const c of categories) {
  if (!isBilingual(c.name)) err(`category "${c.slug}": name must have { en, ar }`);
  for (const s of c.subcategories || []) {
    if (!isBilingual(s.name)) err(`subcategory "${s.slug}": name must have { en, ar }`);
  }
}

console.log(
  `\n${errors === 0 ? '✓' : '✗'} Validation finished — ${errors} error(s), ${warnings} warning(s).\n`,
);
process.exit(errors === 0 ? 0 : 1);
