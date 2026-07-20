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
    id: 'p001',
    slug: 'core-logo-tee',
    sku: 'LHA-TEE-CORE',
    name: { en: 'Hoopers Tee', ar: 'تيشيرت هوبرز' },
    description: {
      en: 'Performance short-sleeve Hoopers tee with the supplied LHA graphic, built for training and everyday wear.',
      ar: 'تيشيرت هوبرز قصير الأكمام بتصميم LHA المرفق، مناسب للتدريب والارتداء اليومي.',
    },
    category: 'clothing',
    subcategory: 't-shirts',
    productType: 'T-Shirt',
    price: 34,
    compareAt: 42,
    colors: [C.black, C.white, C.grey],
    stockPerVariant: 14,
    material: { en: '100% combed cotton, 220 gsm', ar: 'قطن ممشط 100٪، 220 غم/م²' },
    fit: { en: 'Regular fit', ar: 'قصة عادية' },
    care: { en: 'Machine wash cold, tumble dry low.', ar: 'يُغسل بماء بارد، تجفيف منخفض.' },
    features: {
      en: ['Ribbed crew neck', 'Reinforced shoulder seams', 'Screen-printed LHA mark'],
      ar: ['ياقة مضلعة', 'حياكة أكتاف مقواة', 'طباعة شعار LHA'],
    },
    sizeGuide: 't-shirts',
    featured: true,
    bestSeller: true,
    image: '/images/products/hoopers-tee-black.webp',
    hoverImage: null,
    gallery: [],
    related: ['p002', 'p005', 'p004'],
  }),
  product({
    id: 'p002',
    slug: 'practice-training-tee',
    sku: 'LHA-TEE-PRAC',
    name: { en: 'Hoopers Long Sleeve', ar: 'تيشيرت هوبرز طويل الأكمام' },
    description: {
      en: 'Long-sleeve performance top with the supplied Hoopers graphic for training and warm-ups.',
      ar: 'قميص أداء طويل الأكمام بتصميم هوبرز المرفق للتدريب والإحماء.',
    },
    category: 'clothing',
    subcategory: 't-shirts',
    productType: 'Long Sleeve Top',
    price: 38,
    colors: [C.black, C.red],
    stockPerVariant: 10,
    material: { en: 'Recycled polyester performance knit', ar: 'بوليستر معاد تدويره عالي الأداء' },
    fit: { en: 'Athletic fit', ar: 'قصة رياضية' },
    care: { en: 'Machine wash cold, do not iron print.', ar: 'يُغسل بارداً، لا تكوِ الطباعة.' },
    features: {
      en: ['Moisture-wicking', 'Anti-odour finish', 'Four-way stretch'],
      ar: ['طارد للرطوبة', 'مقاوم للروائح', 'مرونة رباعية'],
    },
    sizeGuide: 't-shirts',
    newArrival: true,
    image: '/images/products/hoopers-long-sleeve-grey.webp',
    hoverImage: null,
    related: ['p001', 'p009'],
  }),
  product({
    id: 'p003',
    slug: 'academy-tank-top',
    sku: 'LHA-TOP-TANK',
    name: { en: 'Academy Tank Top', ar: 'قميص أكاديمية بدون أكمام' },
    description: {
      en: 'Lightweight sleeveless top for shooting drills and hot-day runs.',
      ar: 'قميص خفيف بدون أكمام لتمارين التسديد والأجواء الحارة.',
    },
    category: 'clothing',
    subcategory: 'tops',
    productType: 'Tank Top',
    price: 30,
    colors: [C.black, C.white],
    stockPerVariant: 9,
    material: { en: 'Cotton-modal blend', ar: 'مزيج قطن ومودال' },
    fit: { en: 'Relaxed fit', ar: 'قصة فضفاضة' },
    care: { en: 'Machine wash cold.', ar: 'يُغسل بماء بارد.' },
    features: {
      en: ['Dropped armholes', 'Soft hand-feel'],
      ar: ['فتحات ذراع منخفضة', 'ملمس ناعم'],
    },
    sizeGuide: 'tops',
    image: '/images/products/compression-tank-white.webp',
    hoverImage: null,
    related: ['p001', 'p004'],
  }),
  product({
    id: 'p004',
    slug: 'game-day-shorts',
    sku: 'LHA-SHT-GAME',
    name: { en: 'Game Day Shorts', ar: 'شورت يوم المباراة' },
    description: {
      en: 'Pro-length basketball shorts with deep pockets and a locked-in waistband.',
      ar: 'شورت كرة سلة بطول احترافي بجيوب عميقة وخصر ثابت.',
    },
    category: 'clothing',
    subcategory: 'shorts',
    productType: 'Shorts',
    price: 44,
    compareAt: 52,
    colors: [C.black, C.grey, C.red],
    stockPerVariant: 11,
    material: { en: 'Quick-dry woven polyester', ar: 'بوليستر منسوج سريع الجفاف' },
    fit: { en: 'Regular fit, 9" inseam', ar: 'قصة عادية، طول داخلي 9 إنش' },
    care: { en: 'Machine wash cold, hang dry.', ar: 'يُغسل بارداً، تجفيف بالتعليق.' },
    features: {
      en: ['Zip side pockets', 'Elastic + drawcord waist', 'Ventilation panels'],
      ar: ['جيوب جانبية بسحّاب', 'خصر مطاطي برباط', 'فتحات تهوية'],
    },
    sizeGuide: 'shorts',
    featured: true,
    image: '/images/products/hoopers-shorts-black.webp',
    hoverImage: null,
    related: ['p001', 'p005'],
  }),
  product({
    id: 'p005',
    slug: 'elite-hoodie',
    sku: 'LHA-HOD-ELITE',
    name: { en: 'Elite Hoodie', ar: 'هودي النخبة' },
    description: {
      en: 'Premium heavyweight hoodie with embroidered LHA badge. Warm-up staple.',
      ar: 'هودي ثقيل فاخر بشعار LHA مطرز. أساسي للإحماء.',
    },
    category: 'clothing',
    subcategory: 'hoodies',
    productType: 'Hoodie',
    price: 72,
    compareAt: 88,
    colors: [C.black, C.grey],
    stockPerVariant: 8,
    material: { en: '380 gsm brushed fleece', ar: 'فليس مُمشّط 380 غم/م²' },
    fit: { en: 'Oversized fit', ar: 'قصة واسعة' },
    care: { en: 'Wash inside out, cold.', ar: 'يُغسل مقلوباً وبارداً.' },
    features: {
      en: ['Embroidered badge', 'Double-lined hood', 'Kangaroo pocket'],
      ar: ['شعار مطرز', 'قبعة مبطنة مزدوجة', 'جيب أمامي'],
    },
    sizeGuide: 'hoodies',
    featured: true,
    bestSeller: true,
    related: ['p006', 'p007', 'p001'],
  }),
  product({
    id: 'p006',
    slug: 'training-hoodie',
    sku: 'LHA-HOD-TRN',
    name: { en: 'Training Hoodie', ar: 'هودي التدريب' },
    description: {
      en: 'Mid-weight tech hoodie that keeps you loose through warm-ups and cool-downs.',
      ar: 'هودي تقني متوسط الوزن يبقيك مرناً أثناء الإحماء والاسترخاء.',
    },
    category: 'clothing',
    subcategory: 'hoodies',
    productType: 'Hoodie',
    price: 64,
    colors: [C.black],
    stockPerVariant: 10,
    material: { en: 'Cotton-poly tech fleece', ar: 'فليس تقني قطن وبوليستر' },
    fit: { en: 'Regular fit', ar: 'قصة عادية' },
    care: { en: 'Machine wash cold.', ar: 'يُغسل بماء بارد.' },
    features: {
      en: ['Zip chest pocket', 'Thumbholes', 'Adjustable hood'],
      ar: ['جيب صدر بسحّاب', 'فتحات إبهام', 'قبعة قابلة للتعديل'],
    },
    sizeGuide: 'hoodies',
    related: ['p005', 'p007'],
  }),
  product({
    id: 'p007',
    slug: 'tech-training-pants',
    sku: 'LHA-PNT-TECH',
    name: { en: 'Tech Training Pants', ar: 'بنطال التدريب التقني' },
    description: {
      en: 'Tapered training pants with zip ankles for quick changes courtside.',
      ar: 'بنطال تدريب مدبب بسحّاب عند الكاحل لتغيير سريع بجانب الملعب.',
    },
    category: 'clothing',
    subcategory: 'pants',
    productType: 'Pants',
    price: 58,
    compareAt: 70,
    colors: [C.black, C.grey],
    stockPerVariant: 9,
    material: { en: 'Stretch woven polyester', ar: 'بوليستر منسوج مطاطي' },
    fit: { en: 'Tapered fit', ar: 'قصة مدببة' },
    care: { en: 'Machine wash cold.', ar: 'يُغسل بماء بارد.' },
    features: {
      en: ['Zip ankles', 'Zip pockets', 'Elastic drawcord waist'],
      ar: ['سحّاب عند الكاحل', 'جيوب بسحّاب', 'خصر مطاطي برباط'],
    },
    sizeGuide: 'pants',
    newArrival: true,
    related: ['p005', 'p008'],
  }),
  product({
    id: 'p008',
    slug: 'academy-fleece-set',
    sku: 'LHA-SET-FLC',
    name: { en: 'Academy Fleece Set', ar: 'طقم فليس الأكاديمية' },
    description: {
      en: 'Matching hoodie-and-jogger fleece set in premium heavyweight cotton.',
      ar: 'طقم فليس متناسق (هودي وجوجر) من قطن ثقيل فاخر.',
    },
    category: 'clothing',
    subcategory: 'fleece-sets',
    productType: 'Fleece Set',
    price: 118,
    compareAt: 140,
    colors: [C.black, C.grey],
    stockPerVariant: 7,
    material: { en: '380 gsm brushed fleece', ar: 'فليس مُمشّط 380 غم/م²' },
    fit: { en: 'Relaxed set', ar: 'طقم فضفاض' },
    care: { en: 'Wash cold, inside out.', ar: 'يُغسل بارداً ومقلوباً.' },
    features: {
      en: ['Matching hoodie + joggers', 'Embroidered marks', 'Ribbed cuffs'],
      ar: ['هودي وجوجر متناسقان', 'شعارات مطرزة', 'أساور مضلعة'],
    },
    sizeGuide: 'fleece-sets',
    featured: true,
    related: ['p005', 'p007'],
  }),
  product({
    id: 'p009',
    slug: 'compression-top',
    sku: 'LHA-CMP-TOP',
    name: { en: 'Compression Top', ar: 'قميص ضاغط' },
    description: {
      en: 'Second-skin compression top for support, recovery and layering under kit.',
      ar: 'قميص ضاغط كالطبقة الثانية للدعم والتعافي والارتداء تحت الزي.',
    },
    category: 'clothing',
    subcategory: 'compression',
    productType: 'Compression',
    price: 40,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [C.black, C.white],
    stockPerVariant: 12,
    material: { en: 'Nylon-elastane compression knit', ar: 'نايلون وإيلاستان ضاغط' },
    fit: { en: 'Compression fit', ar: 'قصة ضاغطة' },
    care: { en: 'Machine wash cold, no fabric softener.', ar: 'يُغسل بارداً، بدون منعّم أقمشة.' },
    features: {
      en: ['Muscle support', 'Flatlock seams', 'Breathable mesh zones'],
      ar: ['دعم العضلات', 'حياكة مسطحة', 'مناطق شبكية للتهوية'],
    },
    sizeGuide: 'compression',
    image: '/images/products/compression-top-black.webp',
    hoverImage: null,
    related: ['p010', 'p002'],
  }),
  product({
    id: 'p010',
    slug: 'compression-tights',
    sku: 'LHA-CMP-TGT',
    name: { en: 'Compression Shorts', ar: 'شورت ضاغط' },
    description: {
      en: 'Compression shorts engineered for explosive movement, muscle support and recovery.',
      ar: 'شورت ضاغط مصمم للحركة الانفجارية ودعم العضلات والتعافي.',
    },
    category: 'clothing',
    subcategory: 'compression',
    productType: 'Compression',
    price: 46,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [C.black],
    stockPerVariant: 10,
    material: { en: 'Nylon-elastane compression knit', ar: 'نايلون وإيلاستان ضاغط' },
    fit: { en: 'Compression fit', ar: 'قصة ضاغطة' },
    care: { en: 'Machine wash cold.', ar: 'يُغسل بماء بارد.' },
    features: {
      en: ['Squat-proof knit', 'Hidden waist pocket', 'Flatlock seams'],
      ar: ['نسيج غير شفاف', 'جيب خصر مخفي', 'حياكة مسطحة'],
    },
    sizeGuide: 'compression',
    image: '/images/products/compression-shorts-black.webp',
    hoverImage: null,
    related: ['p009'],
  }),
  product({
    id: 'p011',
    slug: 'court-duffle-bag',
    sku: 'LHA-BAG-DUF',
    name: { en: 'Court Duffle Bag', ar: 'حقيبة دفل الملعب' },
    description: {
      en: 'Spacious duffle with a vented shoe compartment and ball straps.',
      ar: 'حقيبة واسعة بحجرة أحذية مهواة وأحزمة للكرة.',
    },
    category: 'accessories',
    subcategory: 'bags',
    productType: 'Bag',
    price: 68,
    sizes: ['OS'],
    colors: [C.black],
    stockPerVariant: 15,
    material: { en: 'Water-resistant 600D polyester', ar: 'بوليستر 600D مقاوم للماء' },
    fit: { en: 'One size · 45L', ar: 'مقاس واحد · 45 لتر' },
    care: { en: 'Wipe clean.', ar: 'يُنظّف بالمسح.' },
    features: {
      en: ['Vented shoe pocket', 'Ball straps', 'Padded shoulder strap'],
      ar: ['جيب أحذية مهوى', 'أحزمة كرة', 'حزام كتف مبطّن'],
    },
    sizeGuide: null,
    bestSeller: true,
    related: ['p012'],
  }),
  product({
    id: 'p012',
    slug: 'academy-backpack',
    sku: 'LHA-BAG-BPK',
    name: { en: 'Academy Backpack', ar: 'حقيبة ظهر الأكاديمية' },
    description: {
      en: 'Everyday backpack with a laptop sleeve and dedicated ball net.',
      ar: 'حقيبة ظهر يومية بجيب للحاسوب وشبكة مخصصة للكرة.',
    },
    category: 'accessories',
    subcategory: 'bags',
    productType: 'Bag',
    price: 58,
    sizes: ['OS'],
    colors: [C.black, C.grey],
    stockPerVariant: 12,
    material: { en: 'Recycled ripstop nylon', ar: 'نايلون ريبستوب معاد تدويره' },
    fit: { en: 'One size · 26L', ar: 'مقاس واحد · 26 لتر' },
    care: { en: 'Wipe clean.', ar: 'يُنظّف بالمسح.' },
    features: {
      en: ['15" laptop sleeve', 'External ball net', 'Water-bottle pockets'],
      ar: ['جيب حاسوب 15 إنش', 'شبكة كرة خارجية', 'جيوب لزجاجة الماء'],
    },
    sizeGuide: null,
    newArrival: true,
    related: ['p011'],
  }),
  product({
    id: 'p013',
    slug: 'performance-basketball-socks',
    sku: 'LHA-ACC-HBD',
    name: { en: 'Performance Basketball Socks', ar: 'جوارب كرة سلة للأداء' },
    description: {
      en: 'Cushioned basketball socks with breathable zones and a low-profile LHA mark.',
      ar: 'جوارب كرة سلة مبطنة بمناطق تهوية وشعار LHA أنيق.',
    },
    category: 'clothing',
    subcategory: 'socks',
    productType: 'Socks',
    price: 16,
    sizes: ['OS'],
    colors: [{ ...C.black, stock: 0 }],
    material: { en: 'Cotton-elastane terry', ar: 'قطن وإيلاستان' },
    fit: { en: 'One size', ar: 'مقاس واحد' },
    care: { en: 'Machine wash cold.', ar: 'يُغسل بماء بارد.' },
    features: {
      en: ['Cushioned footbed', 'Breathable knit', 'Stay-put fit'],
      ar: ['وسادة للقدم', 'نسيج جيد التهوية', 'ثبات محكم'],
    },
    sizeGuide: null,
    image: '/images/products/performance-socks-black-white.webp',
    hoverImage: null,
    related: ['p011'],
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
