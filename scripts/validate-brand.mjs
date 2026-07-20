import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const required = [
  'public/brand/lha-mark-black.png',
  'public/brand/lha-mark-white.png',
  'public/favicon.svg',
  'public/images/brand/og-image.png',
  'public/site.webmanifest',
];
const intentionallyMissing = {
  'public/favicon.ico': 'Optional legacy browser fallback; no HTML or manifest reference remains.',
  'public/apple-touch-icon.png':
    'Optional final raster brand export; no broken HTML reference remains.',
};
let errors = 0;
const validateSvg = (file) => {
  const source = readFileSync(file, 'utf8');
  if (!/<svg[\s>]/.test(source) || !/viewBox=/.test(source)) {
    console.error('INVALID SVG', file);
    errors += 1;
  }
  if (/<script/i.test(source)) {
    console.error('UNSAFE SVG SCRIPT', file);
    errors += 1;
  }
};
for (const file of required) {
  if (!existsSync(file)) {
    console.error('BROKEN CONFIGURATION: MISSING REQUIRED', file);
    errors += 1;
  } else if (file.endsWith('.svg')) validateSvg(file);
}
const html = readFileSync('index.html', 'utf8');
const configFiles = ['src/config.js', 'src/config/brand.js'];
const referenced = new Set();
for (const match of html.matchAll(/(?:href|content)=["'](\/[^"']+)["']/g)) referenced.add(match[1]);
for (const file of configFiles) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(/["'](\/(?:images|brand|icons|favicon)[^"']+)["']/g))
    referenced.add(match[1]);
}
let manifest;
try {
  manifest = JSON.parse(readFileSync('public/site.webmanifest', 'utf8'));
} catch (error) {
  console.error('BROKEN CONFIGURATION: INVALID MANIFEST JSON', error.message);
  errors += 1;
  manifest = {};
}
for (const icon of manifest.icons || []) {
  if (!icon.src || !icon.sizes || !icon.type) {
    console.error('BROKEN CONFIGURATION: INVALID PWA ICON ENTRY', icon);
    errors += 1;
    continue;
  }
  referenced.add(icon.src);
}
for (const url of referenced) {
  if (/^\/\//.test(url)) continue;
  const clean = url.split(/[?#]/)[0];
  const file = path.join('public', clean.replace(/^\//, ''));
  if (!existsSync(file)) {
    console.error('BROKEN CONFIGURATION: REFERENCED ASSET MISSING', url, '->', file);
    errors += 1;
  }
}
for (const [file, reason] of Object.entries(intentionallyMissing)) {
  if (!existsSync(file)) console.warn('ASSET INTENTIONALLY MISSING', file, '-', reason);
}
process.exitCode = errors ? 1 : 0;
