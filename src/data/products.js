// ============================================================================
// PRODUCTS  —  EDITABLE DEMO DATA (replace with your real catalogue).
// ----------------------------------------------------------------------------
// HOW TO ADD A PRODUCT: copy one object below and edit its fields.
//   • Prices are numbers in SITE.currency (see config.js).
//   • `sizes` + `colors` are expanded automatically into `variants` with
//     per-variant inventory by the product() helper — you only set high-level
//     stock via `stockPerVariant` (or per-color via colors[].stock).
//   • Put photos in /public/images/products/  and reference them below.
//   • Availability ('in-stock' | 'sold-out') is derived from total stock.
// ============================================================================

const DEFAULT_CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Reusable colour swatches (add your own — hex drives the on-page dot).
const C = {
  black: { key: 'black', name: { en: 'Black', ar: 'أسود' }, hex: '#111111' },
  white: { key: 'white', name: { en: 'White', ar: 'أبيض' }, hex: '#f5f5f5' },
  grey: { key: 'grey', name: { en: 'Grey', ar: 'رمادي' }, hex: '#9a9a9a' },
  red: { key: 'red', name: { en: 'Red', ar: 'أحمر' }, hex: '#e4002b' },
};

// Factory: fills defaults + builds variants/inventory from sizes × colours.
function product(p) {
  const sizes = p.sizes || DEFAULT_CLOTHING_SIZES;
  const colors = p.colors || [C.black];
  const perVariant = p.stockPerVariant ?? 12;
  const variants = [];
  for (const color of colors) {
    for (const size of sizes) {
      variants.push({
        size,
        color: color.key,
        sku: `${p.sku}-${color.key.slice(0, 2).toUpperCase()}-${size}`,
        stock: color.stock ?? perVariant,
      });
    }
  }
  const stock = variants.reduce((s, v) => s + v.stock, 0);
  return {
    currency: 'USD',
    lowStockThreshold: 6,
    featured: false,
    newArrival: false,
    bestSeller: false,
    gallery: [],
    related: [],
    ...p,
    sizes,
    colors,
    variants,
    stock,
    availability: stock > 0 ? 'in-stock' : 'sold-out',
    image: p.image ?? null,
    hoverImage: p.hoverImage && p.hoverImage !== p.image ? p.hoverImage : null,
    socialImage: p.socialImage ?? p.image ?? null,
    mediaStatus: p.image ? 'supplied' : 'missing',
    alt: p.alt || {
      en: `${p.name.en} — Libya Hoops Academy`,
      ar: `${p.name.ar} — أكاديمية ليبيا هوبس`,
    },
    seoTitle: p.seoTitle || { en: `${p.name.en} | LHA Shop`, ar: `${p.name.ar} | متجر LHA` },
    seoDescription: p.seoDescription || p.description,
  };
}

export const products = [
  product({
    id: 'p014',
    slug: 'all-i-know-is-win-tee',
    sku: 'LHA-TEE-WIN',
    name: { en: 'All I Know Is Win Tee', ar: 'تيشيرت كل ما أعرفه هو الفوز' },
    description: { en: 'Short-sleeve tee featuring the supplied “All I Know Is Win” LHA front graphic and a clean back.', ar: 'تيشيرت قصير الأكمام بطباعة LHA «كل ما أعرفه هو الفوز» في الأمام وظهر سادة.' },
    category: 'clothing', subcategory: 't-shirts', productType: 'T-Shirt', price: 34,
    colors: [
      { ...C.black, image: '/images/products/all-i-know-is-win-tee-black.png' },
      { ...C.white, image: '/images/products/all-i-know-is-win-tee-white.png' },
    ],
    stockPerVariant: 12, material: { en: 'Performance cotton blend', ar: 'مزيج قطني للأداء' },
    fit: { en: 'Regular athletic fit', ar: 'قصة رياضية عادية' }, care: { en: 'Machine wash cold, wash inside out.', ar: 'يُغسل بارداً ومقلوباً.' },
    features: { en: ['Supplied LHA front graphic', 'Clean back', 'Short sleeves'], ar: ['طباعة LHA المرفقة في الأمام', 'ظهر سادة', 'أكمام قصيرة'] },
    sizeGuide: 't-shirts', newArrival: true, image: '/images/products/all-i-know-is-win-tee-black.png', related: ['p015','p016','p020'],
  }),
  product({
    id: 'p015', slug: 'hoops-for-troops-tee', sku: 'LHA-TEE-TROOPS',
    name: { en: 'Hoops for Troops Tee', ar: 'تيشيرت هوبس فور تروبس' },
    description: { en: 'Performance tee with the supplied Hoops for Troops artwork and a clean back.', ar: 'تيشيرت أداء بتصميم Hoops for Troops المرفق وظهر سادة.' },
    category: 'clothing', subcategory: 't-shirts', productType: 'Performance T-Shirt', price: 38,
    colors: [
      { ...C.black, image: '/images/products/hoops-for-troops-tee-black.png' },
      { ...C.grey, image: '/images/products/hoops-for-troops-tee-grey.png' },
    ],
    stockPerVariant: 12, material: { en: 'Moisture-wicking performance knit', ar: 'نسيج أداء طارد للرطوبة' },
    fit: { en: 'Athletic fit', ar: 'قصة رياضية' }, care: { en: 'Machine wash cold, do not iron print.', ar: 'يُغسل بارداً، ولا تُكوى الطباعة.' },
    features: { en: ['Supplied Hoops for Troops artwork', 'Dri-Fit hem detail', 'Clean back'], ar: ['تصميم Hoops for Troops المرفق', 'تفصيل Dri-Fit عند الحافة', 'ظهر سادة'] },
    sizeGuide: 't-shirts', newArrival: true, image: '/images/products/hoops-for-troops-tee-black.png', related: ['p014','p016','p020'],
  }),
  product({
    id: 'p016', slug: 'hoopers-performance-tee', sku: 'LHA-TEE-HOOPERS',
    name: { en: 'Hoopers Performance Tee', ar: 'تيشيرت هوبرز للأداء' },
    description: { en: 'Black performance tee featuring the supplied Hoopers badge artwork, Dri-Fit detail and woven lower label.', ar: 'تيشيرت أداء أسود بتصميم هوبرز المرفق وتفصيل Dri-Fit والملصق السفلي المنسوج.' },
    category: 'clothing', subcategory: 't-shirts', productType: 'Performance T-Shirt', price: 38,
    colors: [
      { ...C.black, image: '/images/products/hoopers-performance-tee-black.jpeg' },
      { ...C.grey, image: '/images/products/hoopers-performance-tee-grey.jpeg' },
    ], stockPerVariant: 12,
    material: { en: 'Quick-dry performance polyester', ar: 'بوليستر أداء سريع الجفاف' }, fit: { en: 'Athletic fit', ar: 'قصة رياضية' },
    care: { en: 'Machine wash cold, hang dry.', ar: 'يُغسل بارداً ويُجفف بالتعليق.' }, features: { en: ['Supplied Hoopers badge graphic','Dri-Fit detail','Woven lower label'], ar: ['تصميم شارة هوبرز المرفق','تفصيل Dri-Fit','ملصق سفلي منسوج'] },
    sizeGuide: 't-shirts', newArrival: true, image: '/images/products/hoopers-performance-tee-black.jpeg', related: ['p017','p018','p015'],
  }),
  product({
    id: 'p017', slug: 'hoopers-long-sleeve-performance', sku: 'LHA-LS-HOOPERS',
    name: { en: 'Hoopers Long Sleeve Performance', ar: 'قميص هوبرز طويل الأكمام للأداء' },
    description: { en: 'Grey long-sleeve performance top featuring the supplied Hoopers badge artwork.', ar: 'قميص أداء رمادي طويل الأكمام بتصميم هوبرز المرفق.' },
    category: 'clothing', subcategory: 'tops', productType: 'Long Sleeve Performance Top', price: 42,
    colors: [
      { ...C.grey, image: '/images/products/hoopers-long-sleeve-performance-grey.jpeg' },
      { ...C.black, image: '/images/products/hoopers-long-sleeve-performance-black.jpeg' },
    ], stockPerVariant: 10,
    material: { en: 'Quick-dry stretch performance knit', ar: 'نسيج أداء مرن سريع الجفاف' }, fit: { en: 'Athletic fit', ar: 'قصة رياضية' }, care: { en: 'Machine wash cold, hang dry.', ar: 'يُغسل بارداً ويُجفف بالتعليق.' },
    features: { en: ['Long sleeves','Supplied Hoopers badge graphic','Dri-Fit detail'], ar: ['أكمام طويلة','تصميم شارة هوبرز المرفق','تفصيل Dri-Fit'] },
    sizeGuide: 'tops', newArrival: true, image: '/images/products/hoopers-long-sleeve-performance-grey.jpeg', related: ['p016','p019','p015'],
  }),
  product({
    id: 'p018', slug: 'lha-performance-shorts', sku: 'LHA-SHT-PERF',
    name: { en: 'LHA Performance Shorts', ar: 'شورت LHA للأداء' }, description: { en: 'Black performance shorts with the supplied white LHA logo.', ar: 'شورت أداء أسود بشعار LHA الأبيض.' },
    category: 'clothing', subcategory: 'shorts', productType: 'Performance Shorts', price: 44,
    colors: [{ ...C.black, image: '/images/products/lha-performance-shorts-black.png' }], stockPerVariant: 12,
    material: { en: 'Quick-dry performance polyester', ar: 'بوليستر أداء سريع الجفاف' }, fit: { en: 'Regular basketball fit', ar: 'قصة كرة سلة عادية' }, care: { en: 'Machine wash cold, hang dry.', ar: 'يُغسل بارداً ويُجفف بالتعليق.' },
    features: { en: ['Elastic waistband','Supplied LHA logo','Clean back'], ar: ['خصر مطاطي','شعار LHA المرفق','ظهر سادة'] }, sizeGuide: 'shorts', newArrival: true,
    image: '/images/products/lha-performance-shorts-black.png', related: ['p016','p019','p004'],
  }),
  product({
    id: 'p019', slug: 'lha-logo-performance-tee', sku: 'LHA-TEE-LOGO',
    name: { en: 'LHA Logo Performance Tee', ar: 'تيشيرت شعار LHA للأداء' }, description: { en: 'Performance tee with a centered LHA logo and clean back.', ar: 'تيشيرت أداء بشعار LHA في المنتصف وظهر سادة.' },
    category: 'clothing', subcategory: 't-shirts', productType: 'Performance T-Shirt', price: 36,
    colors: [
      { ...C.black, image: '/images/products/lha-logo-performance-tee-black.png' },
      { ...C.grey, image: '/images/products/lha-logo-performance-tee-grey.png' },
    ], stockPerVariant: 12,
    material: { en: 'Quick-dry performance polyester', ar: 'بوليستر أداء سريع الجفاف' }, fit: { en: 'Athletic fit', ar: 'قصة رياضية' }, care: { en: 'Machine wash cold, hang dry.', ar: 'يُغسل بارداً ويُجفف بالتعليق.' },
    features: { en: ['Centered supplied LHA logo','Dri-Fit hem detail','Clean back'], ar: ['شعار LHA المرفق في المنتصف','تفصيل Dri-Fit عند الحافة','ظهر سادة'] },
    sizeGuide: 't-shirts', newArrival: true, image: '/images/products/lha-logo-performance-tee-black.png', related: ['p016','p017','p018'],
  }),
  product({
    id: 'p020', slug: 'libya-hoops-academy-tee', sku: 'LHA-TEE-ACADEMY',
    name: { en: 'Libya Hoops Academy Tee', ar: 'تيشيرت أكاديمية ليبيا هوبس' }, description: { en: 'Clean short-sleeve tee with bold Libya Hoops Academy typography.', ar: 'تيشيرت قصير الأكمام بطباعة أكاديمية ليبيا هوبس الواضحة.' },
    category: 'clothing', subcategory: 't-shirts', productType: 'T-Shirt', price: 34,
    colors: [
      { ...C.black, image: '/images/products/libya-hoops-academy-tee-black.png' },
      { ...C.grey, image: '/images/products/libya-hoops-academy-tee-grey.png' },
    ], stockPerVariant: 12, material: { en: 'Performance cotton blend', ar: 'مزيج قطني للأداء' }, fit: { en: 'Regular athletic fit', ar: 'قصة رياضية عادية' }, care: { en: 'Machine wash cold.', ar: 'يُغسل بارداً.' },
    features: { en: ['Bold academy typography','Short sleeves','Clean back'], ar: ['طباعة الأكاديمية','أكمام قصيرة','ظهر سادة'] }, sizeGuide: 't-shirts', newArrival: true,
    image: '/images/products/libya-hoops-academy-tee-black.png', related: ['p014','p019','p021'],
  }),
  product({
    id: 'p021', slug: 'lha-chest-logo-tank', sku: 'LHA-TANK-CHEST',
    name: { en: 'LHA Chest Logo Performance Tank', ar: 'قميص LHA أداء بدون أكمام بشعار جانبي' }, description: { en: 'Fitted performance tank with a compact LHA chest logo.', ar: 'قميص أداء ضيق بدون أكمام بشعار LHA صغير على الصدر.' },
    category: 'clothing', subcategory: 'tops', productType: 'Performance Tank', price: 30,
    colors: [
      { ...C.white, image: '/images/products/lha-chest-logo-tank-white.png' },
      { ...C.black, image: '/images/products/lha-chest-logo-tank-black.png' },
    ], stockPerVariant: 12, material: { en: 'Stretch performance knit', ar: 'نسيج أداء مرن' }, fit: { en: 'Compression fit', ar: 'قصة ضاغطة' }, care: { en: 'Machine wash cold.', ar: 'يُغسل بارداً.' },
    features: { en: ['Sleeveless','Compact chest logo','Four-way stretch'], ar: ['بدون أكمام','شعار صغير على الصدر','مرونة رباعية'] }, sizeGuide: 'tops', newArrival: true,
    image: '/images/products/lha-chest-logo-tank-white.png', related: ['p022','p023','p019'],
  }),
  product({
    id: 'p022', slug: 'lha-center-logo-tank', sku: 'LHA-TANK-CENTER',
    name: { en: 'LHA Center Logo Performance Tank', ar: 'قميص LHA أداء بدون أكمام بشعار وسطي' }, description: { en: 'Fitted performance tank with a centered LHA logo.', ar: 'قميص أداء ضيق بدون أكمام بشعار LHA في المنتصف.' },
    category: 'clothing', subcategory: 'tops', productType: 'Performance Tank', price: 30,
    colors: [
      { ...C.white, image: '/images/products/lha-center-logo-tank-white.png' },
      { ...C.black, image: '/images/products/lha-center-logo-tank-black.png' },
    ], stockPerVariant: 12, material: { en: 'Stretch performance knit', ar: 'نسيج أداء مرن' }, fit: { en: 'Compression fit', ar: 'قصة ضاغطة' }, care: { en: 'Machine wash cold.', ar: 'يُغسل بارداً.' },
    features: { en: ['Sleeveless','Centered logo','Four-way stretch'], ar: ['بدون أكمام','شعار وسطي','مرونة رباعية'] }, sizeGuide: 'tops', newArrival: true,
    image: '/images/products/lha-center-logo-tank-white.png', related: ['p021','p023','p019'],
  }),
  product({
    id: 'p023', slug: 'lha-compression-long-sleeve', sku: 'LHA-COMP-LS',
    name: { en: 'LHA Compression Long Sleeve', ar: 'قميص LHA ضاغط طويل الأكمام' }, description: { en: 'Long-sleeve compression top with a centered LHA logo.', ar: 'قميص ضاغط طويل الأكمام بشعار LHA في المنتصف.' },
    category: 'clothing', subcategory: 'compression', productType: 'Compression Top', price: 42,
    colors: [
      { ...C.white, image: '/images/products/lha-compression-long-sleeve-white.png' },
      { ...C.black, image: '/images/products/lha-compression-long-sleeve-black.png' },
    ], stockPerVariant: 12, material: { en: 'Four-way stretch compression fabric', ar: 'قماش ضاغط بمرونة رباعية' }, fit: { en: 'Compression fit', ar: 'قصة ضاغطة' }, care: { en: 'Machine wash cold, hang dry.', ar: 'يُغسل بارداً ويُجفف بالتعليق.' },
    features: { en: ['Long sleeves','Centered logo','Moisture-wicking'], ar: ['أكمام طويلة','شعار وسطي','طارد للرطوبة'] }, sizeGuide: 'compression', newArrival: true,
    image: '/images/products/lha-compression-long-sleeve-white.png', related: ['p021','p022','p024'],
  }),

  product({
    id: 'p024',
    slug: 'lha-full-length-compression-tights',
    sku: 'LHA-CMP-FULL',
    name: { en: 'LHA Full-Length Compression Tights', ar: 'بنطال LHA ضاغط كامل الطول' },
    description: {
      en: 'Full-length compression tights with a secure performance waistband and LHA lower-leg logo.',
      ar: 'بنطال ضاغط كامل الطول بخصر رياضي ثابت وشعار LHA أسفل الساق.',
    },
    category: 'clothing',
    subcategory: 'compression',
    productType: 'Compression Tights',
    price: 48,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { ...C.black, image: '/images/products/lha-full-length-compression-tights-black.png' },
      { ...C.white, image: '/images/products/lha-full-length-compression-tights-white.png' },
    ],
    stockPerVariant: 10,
    material: { en: 'Four-way stretch compression knit', ar: 'نسيج ضاغط بمرونة رباعية' },
    fit: { en: 'Second-skin compression fit', ar: 'قصة ضاغطة محكمة' },
    care: { en: 'Machine wash cold, no fabric softener.', ar: 'يُغسل بارداً، بدون منعّم أقمشة.' },
    features: {
      en: ['Full-length support', 'Performance waistband', 'Flatlock seams'],
      ar: ['دعم كامل الطول', 'خصر رياضي ثابت', 'حياكة مسطحة'],
    },
    sizeGuide: 'compression',
    newArrival: true,
    image: '/images/products/lha-full-length-compression-tights-black.png',
    related: ['p023', 'p025', 'p018'],
  }),
  product({
    id: 'p025',
    slug: 'lha-one-leg-compression-tights',
    sku: 'LHA-CMP-ONELEG',
    name: { en: 'LHA One-Leg Compression Tights', ar: 'بنطال LHA ضاغط بساق واحدة' },
    description: {
      en: 'Asymmetric one-leg compression tights designed for basketball movement, support and layering.',
      ar: 'بنطال ضاغط غير متماثل بساق واحدة مصمم لحركة كرة السلة والدعم والارتداء تحت الزي.',
    },
    category: 'clothing',
    subcategory: 'compression',
    productType: 'One-Leg Compression Tights',
    price: 46,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { ...C.black, image: '/images/products/lha-one-leg-compression-tights-black.png' },
      { ...C.white, image: '/images/products/lha-one-leg-compression-tights-white.png' },
    ],
    stockPerVariant: 10,
    material: { en: 'Four-way stretch compression knit', ar: 'نسيج ضاغط بمرونة رباعية' },
    fit: { en: 'Second-skin asymmetric fit', ar: 'قصة ضاغطة غير متماثلة' },
    care: { en: 'Machine wash cold, no fabric softener.', ar: 'يُغسل بارداً، بدون منعّم أقمشة.' },
    features: {
      en: ['Asymmetric one-leg cut', 'Flatlock seams', 'LHA logo details'],
      ar: ['قصة بساق واحدة', 'حياكة مسطحة', 'تفاصيل شعار LHA'],
    },
    sizeGuide: 'compression',
    newArrival: true,
    image: '/images/products/lha-one-leg-compression-tights-black.png',
    related: ['p024', 'p023', 'p018'],
  }),
  product({
    id: 'p026',
    slug: 'lha-sleeve-logo-performance-tee',
    sku: 'LHA-TEE-SLEEVE',
    name: { en: 'LHA Sleeve Logo Performance Tee', ar: 'تيشيرت LHA للأداء بشعار الأكمام' },
    description: {
      en: 'Fitted short-sleeve performance tee with clean front and back panels and LHA logos on both sleeves.',
      ar: 'تيشيرت أداء ضيق قصير الأكمام بواجهة وظهر سادة وشعارات LHA على كلا الكمين.',
    },
    category: 'clothing',
    subcategory: 't-shirts',
    productType: 'Performance T-Shirt',
    price: 38,
    colors: [
      { ...C.black, image: '/images/products/lha-sleeve-logo-performance-tee-black.png' },
      { ...C.white, image: '/images/products/lha-sleeve-logo-performance-tee-white.png' },
    ],
    stockPerVariant: 12,
    material: { en: 'Moisture-wicking stretch performance knit', ar: 'نسيج أداء مرن وطارد للرطوبة' },
    fit: { en: 'Fitted athletic cut', ar: 'قصة رياضية ضيقة' },
    care: { en: 'Machine wash cold, hang dry.', ar: 'يُغسل بارداً ويُجفف بالتعليق.' },
    features: {
      en: ['LHA logos on both sleeves', 'Clean front and back', 'Four-way stretch'],
      ar: ['شعار LHA على كلا الكمين', 'واجهة وظهر سادة', 'مرونة رباعية الاتجاهات'],
    },
    sizeGuide: 't-shirts',
    newArrival: true,
    image: '/images/products/lha-sleeve-logo-performance-tee-black.png',
    related: ['p019', 'p020', 'p023'],
  }),

];

// ── Selectors ──
export const getProduct = (slug) => products.find((p) => p.slug === slug);
export const getProductById = (id) => products.find((p) => p.id === id);
export const featuredProducts = () => products.filter((p) => p.featured);
export const newArrivals = () => products.filter((p) => p.newArrival);
export const bestSellers = () => products.filter((p) => p.bestSeller);
export const productsByCategory = (cat) => products.filter((p) => p.category === cat);
export const productsBySubcategory = (cat, sub) =>
  products.filter((p) => p.category === cat && p.subcategory === sub);
export const relatedProducts = (product, limit = 4) =>
  (product?.related || []).map(getProductById).filter(Boolean).slice(0, limit);
export const isLowStock = (p) => p.availability === 'in-stock' && p.stock <= p.lowStockThreshold;

// All colours/sizes present in the catalogue (drives shop filters).
export const allColors = Array.from(
  new Map(products.flatMap((p) => p.colors).map((c) => [c.key, c])).values(),
);
export const allSizes = Array.from(new Set(products.flatMap((p) => p.sizes)));
