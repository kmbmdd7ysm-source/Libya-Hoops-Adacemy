// ============================================================================
// SHOP CATEGORIES  —  EDIT HERE to add / rename categories & subcategories.
// `slug` values drive the URLs:  /shop/:category/:subcategory
// ============================================================================

export const categories = [
  {
    slug: 'clothing',
    name: { en: 'Clothing', ar: 'الملابس' },
    image: '/images/categories/clothing-hero-player.jpeg',
    subcategories: [
      {
        slug: 't-shirts',
        name: { en: 'T-Shirts', ar: 'تيشيرتات' },
        image: '/images/categories/t-shirts.jpg',
      },
      {
        slug: 'tops',
        name: { en: 'Tops', ar: 'قمصان علوية' },
        image: '/images/categories/tops.jpg',
      },
      {
        slug: 'shorts',
        name: { en: 'Shorts', ar: 'شورتات' },
        image: '/images/categories/shorts.jpg',
      },
      {
        slug: 'hoodies',
        name: { en: 'Hoodies', ar: 'هوديز' },
        image: '/images/categories/hoodies.jpg',
      },
      { slug: 'pants', name: { en: 'Pants', ar: 'بناطيل' }, image: '/images/categories/pants.jpg' },
      {
        slug: 'fleece-sets',
        name: { en: 'Fleece Sets', ar: 'أطقم فليس' },
        image: '/images/categories/fleece-sets.jpg',
      },
      {
        slug: 'compression',
        name: { en: 'Compression', ar: 'ملابس ضاغطة' },
        image: '/images/categories/compression.jpg',
      },
      {
        slug: 'socks',
        name: { en: 'Socks', ar: 'جوارب' },
        image: '/images/products/performance-socks-black-white.webp',
      },
    ],
  },
  {
    slug: 'accessories',
    name: { en: 'Accessories', ar: 'الإكسسوارات' },
    image: '/images/categories/accessories-hero-player.jpeg',
    subcategories: [
      { slug: 'bags', name: { en: 'Bags', ar: 'حقائب' }, image: '/images/categories/bags.jpg' },
      { slug: 'other', name: { en: 'Other', ar: 'أخرى' }, image: '/images/categories/other.jpg' },
    ],
  },
];

export const getCategory = (slug) => categories.find((c) => c.slug === slug);
export const getSubcategory = (categorySlug, subSlug) =>
  getCategory(categorySlug)?.subcategories.find((s) => s.slug === subSlug);

// Flat lookups used by the mega-menu and breadcrumbs.
export const allSubcategories = categories.flatMap((c) =>
  c.subcategories.map((s) => ({ ...s, category: c.slug, categoryName: c.name })),
);

export const findSubcategoryAnywhere = (subSlug) =>
  allSubcategories.find((s) => s.slug === subSlug);
