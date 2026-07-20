import { existsSync } from 'node:fs';
import { products } from '../src/data/products.js';

let errors = 0;
let warnings = 0;
const owners = new Map();

for (const product of products) {
  const sources = [product.image, product.hoverImage, ...(product.gallery || [])].filter(Boolean);

  if (!product.image) {
    if (product.mediaStatus !== 'missing') {
      console.error('Missing media must be explicitly marked:', product.id, product.slug);
      errors++;
    }
    continue;
  }

  if (product.mediaStatus !== 'supplied') {
    console.error('Supplied media has incorrect status:', product.id, product.slug);
    errors++;
  }

  if (product.hoverImage === product.image) {
    console.error('Primary and hover media are identical:', product.id, product.slug);
    errors++;
  }

  for (const source of sources) {
    if (!source.startsWith('/')) {
      console.error('Product media must use a public absolute path:', product.id, source);
      errors++;
      continue;
    }
    if (!existsSync(`public${source}`)) {
      console.error('Product media file is missing:', product.id, source);
      errors++;
    }
    const owner = owners.get(source);
    if (owner && owner !== product.id) {
      console.error('Product image borrowed by unrelated products:', owner, product.id, source);
      errors++;
    } else {
      owners.set(source, product.id);
    }
  }
}

console.log(`Media validation: ${errors} errors, ${warnings} warnings`);
process.exitCode = errors ? 1 : 0;
