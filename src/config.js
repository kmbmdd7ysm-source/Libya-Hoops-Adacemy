// ============================================================================
// LIBYA HOOPS ACADEMY — CENTRAL SITE CONFIGURATION
// ----------------------------------------------------------------------------
// EDIT HERE: brand details, contact info, social links, currency, shipping.
// Leave a value as an empty string ('') to hide it across the whole site.
// Do NOT put secret API keys here — use environment variables (.env).
// ============================================================================

export const SITE = {
  name: 'Libya Hoops Academy',
  shortName: 'LHA',
  slogan: { en: 'Own The Game.', ar: 'امتلك اللعبة.' },
  domain: 'https://libyahoopsacademy.com', // - change to your production domain

  // ── Official Libya Hoops Academy brand assets ──
  logo: '/brand/lha-mark-black.png',
  logoLight: '/brand/lha-mark-white.png',
  wordmark: '/brand/lha-wordmark-black.svg',
  wordmarkLight: '/brand/lha-wordmark-white.svg',
  defaultOg: '/images/brand/og-image.png',

  // ── Official contact details (empty optional values stay hidden) ──
  email: 'Libyahoopsacademy@gmail.com',
  emailLink: 'mailto:Libyahoopsacademy@gmail.com',
  phone: '', // e.g. '+218 00 000 0000'
  whatsapp: '', // full international number, digits only, e.g. '2180000000'
  address: { en: '', ar: '' },
  hours: { en: '', ar: '' },
  mapLink: '',

  // ── Official social links ──
  social: {
    instagram: 'https://www.instagram.com/libyahoopsacademy',
    facebook: 'https://www.facebook.com/share/19EM6Pz1n3/?mibextid=wwXIfr',
    tiktok: 'https://www.tiktok.com/@libyahoopsacademy?_r=1&_t=ZS-987u4toLwAR',
    youtube: '',
  },

  // ── Commerce ──
  currency: 'USD', // ISO code used for formatting + structured data
  currencySymbol: '$', // shown before the amount (RTL-safe in code)
  locale: { en: 'en-US', ar: 'ar-LY' },

  legalUpdated: { en: 'July 14, 2026', ar: '14 يوليو 2026' },
};

// Storage keys (functional/necessary storage — never used for tracking).
export const STORAGE_KEYS = {
  language: 'lha-language',
  cart: 'lha-cart',
  consent: 'lha-cookie-consent',
  recentlyViewed: 'lha-recently-viewed',
  wishlist: 'lha-wishlist',
  compare: 'lha-compare',
};
