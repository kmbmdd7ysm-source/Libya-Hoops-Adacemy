// ============================================================================
// NAVIGATION  —  EDIT HERE to change header / mega-menu / footer links.
// Labels are translation keys resolved in the components via t.nav.*
// ============================================================================

// Main header links (label = key inside translations.nav)
export const mainNav = [
  { to: '/', key: 'home' },
  { to: '/about', key: 'about' },
  { to: '/shop', key: 'shop', mega: true },
  { to: '/programs', key: 'programs' },
  { to: '/events', key: 'events' },
  { to: '/online-training', key: 'onlineTraining' },
  { to: '/coaches', key: 'coaches' },
  { to: '/contact', key: 'contact' },
];

// Shop mega-menu columns. `label` uses categories/subcategories names directly.
export const megaMenu = {
  featured: [
    { to: '/shop', key: 'shopAll' },
    { to: '/shop?filter=new', key: 'newArrivals' },
    { to: '/shop?filter=best', key: 'bestSellers' },
    { to: '/shop?filter=essentials', key: 'essentials' },
    { to: '/shop?filter=training', key: 'trainingGear' },
    { to: '/size-guide', key: 'sizeGuide' },
  ],
  columns: [
    {
      title: { en: 'Clothing', ar: 'الملابس' },
      links: [
        { to: '/shop/clothing/t-shirts', label: { en: 'T-Shirts', ar: 'تيشيرتات' } },
        { to: '/shop/clothing/tops', label: { en: 'Tops', ar: 'قمصان علوية' } },
        { to: '/shop/clothing/shorts', label: { en: 'Shorts', ar: 'شورتات' } },
    { to: '/shop/clothing/compression', label: { en: 'Compression', ar: 'ملابس ضاغطة' } },
    { to: '/shop/clothing/hoodies', label: { en: 'Hoodies', ar: 'هوديز' } },
                { to: '/shop/clothing/pants', label: { en: 'Pants', ar: 'بناطيل' } },
        { to: '/shop/clothing/fleece-sets', label: { en: 'Fleece Sets', ar: 'أطقم فليس' } },
        { to: '/shop/clothing/socks', label: { en: 'Socks', ar: 'جوارب' } },
      ],
    },
    {
      title: { en: 'Accessories', ar: 'الإكسسوارات' },
      links: [
        { to: '/shop/accessories/bags', label: { en: 'Bags', ar: 'حقائب' } },
        { to: '/shop/accessories/socks', label: { en: 'Socks', ar: 'جوارب' } },
        { to: '/shop/accessories/balls', label: { en: 'Balls', ar: 'كرات' } },
        { to: '/shop/accessories/hats', label: { en: 'Hats', ar: 'قبعات' } },
        { to: '/shop/accessories/towels', label: { en: 'Towels', ar: 'مناشف' } },
        { to: '/shop/accessories/sleeves-and-armbands', label: { en: 'Sleeves & Armbands', ar: 'أكمام وأربطة الذراع' } },
        { to: '/shop/accessories/other', label: { en: 'Other', ar: 'أخرى' } },
      ],
    },
  ],
};

// Footer link columns (keys resolved via translations).
export const footerNav = {
  shop: [
    { to: '/shop', key: 'shopAll' },
    { to: '/shop/clothing/t-shirts', label: { en: 'T-Shirts', ar: 'تيشيرتات' } },
    { to: '/shop/clothing/tops', label: { en: 'Tops', ar: 'قمصان علوية' } },
    { to: '/shop/clothing/shorts', label: { en: 'Shorts', ar: 'شورتات' } },
    { to: '/shop/clothing/compression', label: { en: 'Compression', ar: 'ملابس ضاغطة' } },
    { to: '/shop/clothing/hoodies', label: { en: 'Hoodies', ar: 'هوديز' } },
    { to: '/shop/clothing/pants', label: { en: 'Pants', ar: 'بناطيل' } },
    { to: '/shop/clothing/fleece-sets', label: { en: 'Fleece Sets', ar: 'أطقم فليس' } },
    { to: '/shop/clothing/socks', label: { en: 'Socks', ar: 'جوارب' } },
    { to: '/shop/accessories/bags', label: { en: 'Bags', ar: 'حقائب' } },
    { to: '/shop/accessories/socks', label: { en: 'Socks', ar: 'جوارب' } },
    { to: '/shop/accessories/balls', label: { en: 'Balls', ar: 'كرات' } },
    { to: '/shop/accessories/hats', label: { en: 'Hats', ar: 'قبعات' } },
    { to: '/shop/accessories/towels', label: { en: 'Towels', ar: 'مناشف' } },
    { to: '/shop/accessories/sleeves-and-armbands', label: { en: 'Sleeves & Armbands', ar: 'أكمام وأربطة الذراع' } },
  ],
  academy: [
    { to: '/about', key: 'about' },
    { to: '/programs', key: 'programs' },
    { to: '/events', key: 'events' },
    { to: '/online-training', key: 'onlineTraining' },
    { to: '/coaches', key: 'coaches' },
    { to: '/contact', key: 'contact' },
  ],
  help: [
    { to: '/faq', key: 'faq' },
    { to: '/size-guide', key: 'sizeGuide' },
    { to: '/shipping-returns', key: 'shipping' },
    { to: '/refund-policy', key: 'refund' },
    { to: '/contact', key: 'contact' },
    { to: '/order-tracking', key: 'orderTracking' },
  ],
  legal: [
    { to: '/privacy-policy', key: 'privacy' },
    { to: '/terms', key: 'terms' },
    { to: '/cookies', key: 'cookies' },
  ],
};
