import { products } from '../data/products';
import { enabledPrograms } from '../data/programs';
import { onlineTraining } from '../data/onlineTraining';
import { events } from '../data/events';
import { availableCoaches } from '../data/coaches';

export const SEARCH_PAGES = [
  {
    type: 'page',
    title: { en: 'About Us', ar: 'من نحن' },
    to: '/about',
    keywords: { en: ['academy'], ar: ['الأكاديمية'] },
  },
  {
    type: 'page',
    title: { en: 'Shop', ar: 'المتجر' },
    to: '/shop',
    keywords: { en: ['products', 'apparel'], ar: ['منتجات', 'ملابس'] },
  },
  {
    type: 'page',
    title: { en: 'Programs', ar: 'البرامج' },
    to: '/programs',
    keywords: { en: ['basketball training'], ar: ['تدريب كرة السلة'] },
  },
  {
    type: 'page',
    title: { en: 'Upcoming Events', ar: 'الفعاليات القادمة' },
    to: '/events',
    keywords: { en: ['events'], ar: ['فعاليات'] },
  },
  {
    type: 'page',
    title: { en: 'Online Training', ar: 'التدريب عبر الإنترنت' },
    to: '/online-training',
    keywords: { en: ['remote training'], ar: ['تدريب عن بعد'] },
  },
  {
    type: 'page',
    title: { en: 'Coaches', ar: 'المدربون' },
    to: '/coaches',
    keywords: { en: ['staff'], ar: ['طاقم'] },
  },
  {
    type: 'page',
    title: { en: 'Help', ar: 'المساعدة' },
    to: '/help',
    keywords: { en: ['support'], ar: ['دعم'] },
  },
  {
    type: 'page',
    title: { en: 'Contact Us', ar: 'تواصل معنا' },
    to: '/contact',
    keywords: { en: ['support'], ar: ['دعم'] },
  },
];

export const POPULAR_SEARCHES = [
  { id: 'programs', query: { en: 'Programs', ar: 'البرامج' }, to: '/programs' },
  { id: 'new-arrivals', query: { en: 'New Arrivals', ar: 'وصل حديثاً' }, to: '/shop' },
  { id: 't-shirts', query: { en: 'T-Shirts', ar: 'قمصان' }, to: '/shop/t-shirts' },
  { id: 'hoodies', query: { en: 'Hoodies', ar: 'هوديز' }, to: '/shop/hoodies' },
  { id: 'shorts', query: { en: 'Shorts', ar: 'شورتات' }, to: '/shop/shorts' },
  { id: 'events', query: { en: 'Events', ar: 'الفعاليات' }, to: '/events' },
  { id: 'coaches', query: { en: 'Coaches', ar: 'المدربون' }, to: '/coaches' },
  {
    id: 'online-training',
    query: { en: 'Online Training', ar: 'التدريب عبر الإنترنت' },
    to: '/online-training',
  },
];

export const normalizeSearchText = (value = '') =>
  String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u0652\u0640]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const flattenText = (...values) =>
  normalizeSearchText(values.flat(Infinity).filter(Boolean).join(' '));
const localizedValues = (value) => [value?.en, value?.ar].filter(Boolean);
const scoreText = (query, candidate) => {
  const q = normalizeSearchText(query);
  const c = normalizeSearchText(candidate);
  if (!q || !c) return -1;
  if (c === q) return 400;
  if (c.startsWith(q)) return 300 - Math.min(c.length - q.length, 50);
  const words = c.split(' ');
  if (words.some((word) => word.startsWith(q))) return 240;
  const index = c.indexOf(q);
  return index >= 0 ? 160 - Math.min(index, 80) : -1;
};

function suggestionCandidates() {
  const out = [];
  products.forEach((item) => {
    out.push({
      id: `product:${item.id}`,
      type: 'product',
      label: item.name,
      to: `/products/${item.slug}`,
      searchable: flattenText(
        ...localizedValues(item.name),
        item.productType,
        item.category,
        item.subcategory,
        item.collection,
        item.tags,
        item.keywords,
        item.colors?.flatMap((color) => localizedValues(color.name)),
      ),
      item,
    });
    [item.category, item.subcategory, ...(item.tags || []), ...(item.keywords || [])]
      .filter(Boolean)
      .forEach((term) => {
        const label = typeof term === 'object' ? term : { en: String(term), ar: String(term) };
        out.push({
          id: `term:${normalizeSearchText(localizedValues(label).join('-'))}`,
          type: 'category',
          label,
          to: '/shop',
          searchable: flattenText(...localizedValues(label)),
        });
      });
  });
  enabledPrograms().forEach((item) =>
    out.push({
      id: `program:${item.slug}`,
      type: 'program',
      label: item.name,
      to: `/programs/${item.slug}`,
      searchable: flattenText(
        ...localizedValues(item.name),
        ...localizedValues(item.summary),
        ...localizedValues(item.ages),
      ),
      item,
    }),
  );
  events.forEach((item) =>
    out.push({
      id: `event:${item.slug}`,
      type: 'event',
      label: item.title,
      to: `/events/${item.slug}`,
      searchable: flattenText(
        ...localizedValues(item.title),
        ...localizedValues(item.description),
        item.category,
        ...localizedValues(item.ageGroup),
      ),
      item,
    }),
  );
  onlineTraining.forEach((item) =>
    out.push({
      id: `training:${item.slug}`,
      type: 'training',
      label: item.title,
      to: `/online-training/${item.slug}`,
      searchable: flattenText(...localizedValues(item.title), ...localizedValues(item.description)),
      item,
    }),
  );
  availableCoaches().forEach((item) =>
    out.push({
      id: `coach:${item.slug}`,
      type: 'coach',
      label: item.name,
      to: `/coaches/${item.slug}`,
      searchable: flattenText(
        ...localizedValues(item.name),
        ...localizedValues(item.role),
        ...localizedValues(item.bio),
      ),
      item,
    }),
  );
  SEARCH_PAGES.forEach((item) =>
    out.push({
      id: `page:${item.to}`,
      type: 'page',
      label: item.title,
      to: item.to,
      searchable: flattenText(...localizedValues(item.title), ...localizedValues(item.keywords)),
      item,
    }),
  );
  return out;
}

let cachedCandidates;
export function getSearchSuggestions(query, limit = 8) {
  const q = normalizeSearchText(query);
  if (!q) return [];
  cachedCandidates ||= suggestionCandidates();
  const seen = new Set();
  return cachedCandidates
    .map((candidate, index) => ({ ...candidate, score: scoreText(q, candidate.searchable), index }))
    .filter((candidate) => candidate.score >= 0)
    .sort((a, b) => b.score - a.score || a.index - b.index || a.id.localeCompare(b.id))
    .filter((candidate) => {
      const key = `${candidate.type}:${normalizeSearchText(localizedValues(candidate.label).join('|'))}:${candidate.to}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

const hit = (query, ...values) =>
  !normalizeSearchText(query) || flattenText(...values).includes(normalizeSearchText(query));
export function searchSite(query = '', limit = 999, filters = {}) {
  const types = filters.types || [];
  const allow = (type) => !types.length || types.includes(type);
  const colors = filters.colors || [];
  const ages = filters.ages || [];
  const productsR = allow('products')
    ? products
        .filter(
          (item) =>
            hit(
              query,
              ...localizedValues(item.name),
              item.productType,
              item.category,
              item.subcategory,
              item.collection,
              item.tags,
              item.keywords,
              ...localizedValues(item.description),
              item.colors?.flatMap((color) => localizedValues(color.name)),
            ) &&
            (!colors.length || item.colors?.some((color) => colors.includes(color.name?.en))),
        )
        .slice(0, limit)
    : [];
  const programs = allow('programs')
    ? enabledPrograms()
        .filter(
          (item) =>
            hit(
              query,
              ...localizedValues(item.name),
              ...localizedValues(item.summary),
              ...localizedValues(item.ages),
            ) &&
            (!ages.length ||
              ages.some((age) =>
                flattenText(...localizedValues(item.ages)).includes(normalizeSearchText(age)),
              )),
        )
        .slice(0, limit)
    : [];
  const eventsR = allow('events')
    ? events
        .filter((item) =>
          hit(
            query,
            ...localizedValues(item.title),
            ...localizedValues(item.description),
            item.category,
            ...localizedValues(item.ageGroup),
          ),
        )
        .slice(0, limit)
    : [];
  const training = allow('training')
    ? onlineTraining
        .filter((item) =>
          hit(query, ...localizedValues(item.title), ...localizedValues(item.description)),
        )
        .slice(0, limit)
    : [];
  const coaches = allow('coaches')
    ? availableCoaches()
        .filter((item) =>
          hit(
            query,
            ...localizedValues(item.name),
            ...localizedValues(item.role),
            ...localizedValues(item.bio),
          ),
        )
        .slice(0, limit)
    : [];
  const pages = allow('pages')
    ? SEARCH_PAGES.filter((item) =>
        hit(query, ...localizedValues(item.title), ...localizedValues(item.keywords)),
      ).slice(0, limit)
    : [];
  return {
    products: productsR,
    programs,
    events: eventsR,
    training,
    coaches,
    pages,
    total:
      productsR.length +
      programs.length +
      eventsR.length +
      training.length +
      coaches.length +
      pages.length,
  };
}

export const searchFacets = {
  types: ['products', 'programs', 'events', 'training', 'coaches', 'pages'],
  colors: [
    ...new Set(
      products
        .flatMap((product) => product.colors || [])
        .map((color) => color.name?.en)
        .filter(Boolean),
    ),
  ].sort(),
  ages: ['6–9', '8–11', '10+', '10–13', '12–17', '12–18', '14–18', '16+', 'All ages'],
};
