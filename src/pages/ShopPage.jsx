import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { SITE } from '../config';
import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Filters from '../components/shop/Filters';
import SortSelect from '../components/shop/SortSelect';
import ProductCard from '../components/shop/ProductCard';
import EmptyState from '../components/common/EmptyState';
import { products } from '../data/products';
import { categories, getCategory, getSubcategory } from '../data/categories';
import { allSizes, allColors } from '../data/products';
import { SORT_OPTIONS } from '../components/shop/SortSelect';
import Icon from '../components/icons/Icon';

const num = (v) => (v === '' || v == null || isNaN(Number(v)) ? null : Number(v));

export default function ShopPage() {
  const { category, subcategory } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, pick } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState('');
  const [mobileDraft, setMobileDraft] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);
  const filterTriggerRef = useRef(null);
  const sortTriggerRef = useRef(null);
  const filterPanelRef = useRef(null);
  const sortPanelRef = useRef(null);

  const cat = category ? getCategory(category) : null;
  const sub = cat && subcategory ? getSubcategory(category, subcategory) : null;

  // Filter state is derived from the URL so direct links + refresh work.
  const filters = useMemo(
    () => ({
      category: category || '',
      subcategory: subcategory || '',
      sizes: params.getAll('size'),
      colors: params.getAll('color'),
      priceMin: params.get('min') || '',
      priceMax: params.get('max') || '',
      inStock: params.get('instock') === '1',
      newOnly: params.get('new') === '1',
      bestOnly: params.get('best') === '1',
      q: params.get('q') || '',
    }),
    [category, subcategory, params],
  );

  const sort = params.get('sort') || 'featured';

  const closeSheets = useCallback(
    (restoreFocus = true) => {
      const wasFilterOpen = mobileOpen;
      const wasSortOpen = sortOpen;
      setMobileOpen(false);
      setSortOpen(false);
      if (restoreFocus) {
        requestAnimationFrame(() => {
          if (wasFilterOpen) filterTriggerRef.current?.focus();
          if (wasSortOpen) sortTriggerRef.current?.focus();
        });
      }
    },
    [mobileOpen, sortOpen],
  );

  const openSheet = useCallback(
    (kind, group = '') => {
      if (kind === 'filter') {
        setMobileDraft({
          sizes: [...filters.sizes],
          colors: [...filters.colors],
          priceMin: filters.priceMin,
          priceMax: filters.priceMax,
          inStock: filters.inStock,
          newOnly: filters.newOnly,
          bestOnly: filters.bestOnly,
        });
        setMobileGroup(group);
        setMobileOpen(true);
        setSortOpen(false);
      } else {
        setSortOpen(true);
        setMobileOpen(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    const open = mobileOpen || sortOpen;
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const panel = mobileOpen ? filterPanelRef.current : sortPanelRef.current;
    const focusable = () => [
      ...(panel?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href]',
      ) || []),
    ];
    requestAnimationFrame(() => focusable()[0]?.focus());
    const onKey = (event) => {
      if (event.key === 'Escape') {
        closeSheets();
        return;
      }
      if (event.key === 'Tab') {
        const items = focusable();
        if (!items.length) return;
        const first = items[0];
        const last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [mobileOpen, sortOpen, closeSheets]);

  const updateParams = useCallback(
    (mutate) => {
      const next = new URLSearchParams(params);
      mutate(next);
      setParams(next, { replace: true, preventScrollReset: true });
    },
    [params, setParams],
  );

  const onChange = useCallback(
    (patch) => {
      // Category / subcategory change the path segment, not the query.
      if ('category' in patch || 'subcategory' in patch) {
        const nextCat = 'category' in patch ? patch.category : filters.category;
        const nextSub =
          'subcategory' in patch
            ? patch.subcategory
            : 'category' in patch
              ? ''
              : filters.subcategory;
        const qs = new URLSearchParams(params);
        let path = '/shop';
        if (nextCat) path += `/${nextCat}`;
        if (nextCat && nextSub) path += `/${nextSub}`;
        const q = qs.toString();
        navigate(q ? `${path}?${q}` : path);
        return;
      }
      updateParams((p) => {
        Object.entries(patch).forEach(([k, v]) => {
          if (k === 'sizes' || k === 'colors') {
            const key = k === 'sizes' ? 'size' : 'color';
            p.delete(key);
            v.forEach((val) => p.append(key, val));
          } else if (k === 'priceMin') {
            v ? p.set('min', v) : p.delete('min');
          } else if (k === 'priceMax') {
            v ? p.set('max', v) : p.delete('max');
          } else if (k === 'inStock') {
            v ? p.set('instock', '1') : p.delete('instock');
          } else if (k === 'newOnly') {
            v ? p.set('new', '1') : p.delete('new');
          } else if (k === 'bestOnly') {
            v ? p.set('best', '1') : p.delete('best');
          }
        });
      });
    },
    [filters, params, navigate, updateParams],
  );

  const onClear = useCallback(() => navigate('/shop'), [navigate]);

  const filterProducts = useCallback(
    (activeFilters) => {
      const min = num(activeFilters.priceMin);
      const max = num(activeFilters.priceMax);
      const q = activeFilters.q.trim().toLowerCase();
      return products.filter((p) => {
        if (activeFilters.category && p.category !== activeFilters.category) return false;
        if (activeFilters.subcategory && p.subcategory !== activeFilters.subcategory) return false;
        if (activeFilters.sizes.length && !p.sizes.some((s) => activeFilters.sizes.includes(s)))
          return false;
        if (
          activeFilters.colors.length &&
          !p.colors.some((c) => activeFilters.colors.includes(c.key))
        )
          return false;
        if (min != null && p.price < min) return false;
        if (max != null && p.price > max) return false;
        if (activeFilters.inStock && p.availability !== 'in-stock') return false;
        if (activeFilters.newOnly && !p.newArrival) return false;
        if (activeFilters.bestOnly && !p.bestSeller) return false;
        if (q) {
          const hay = `${pick(p.name)} ${pick(p.description)}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
    },
    [pick],
  );

  const filtered = useMemo(() => {
    let list = filterProducts(filters);
    const byName = (a, b) => pick(a.name).localeCompare(pick(b.name));
    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        list = [...list].sort(byName);
        break;
      case 'name-desc':
        list = [...list].sort((a, b) => byName(b, a));
        break;
      case 'newest':
        list = [...list].sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
        break;
      default:
        list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return list;
  }, [filters, sort, pick, filterProducts]);

  const mobilePreviewFilters = mobileDraft ? { ...filters, ...mobileDraft } : filters;
  const mobilePreviewCount = useMemo(
    () => filterProducts(mobilePreviewFilters).length,
    [filterProducts, mobilePreviewFilters],
  );

  const heading = sub ? pick(sub.name) : cat ? pick(cat.name) : t.shop.allTitle;
  const path = sub ? `/shop/${category}/${subcategory}` : cat ? `/shop/${category}` : '/shop';

  const crumbs = [{ label: t.nav.shop, to: '/shop' }];
  if (cat)
    crumbs.push(
      sub ? { label: pick(cat.name), to: `/shop/${category}` } : { label: pick(cat.name) },
    );
  if (sub) crumbs.push({ label: pick(sub.name) });

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: heading,
      url: `${SITE.domain}${path}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { name: t.nav.home, url: SITE.domain },
        ...crumbs.map((c) => ({ name: c.label })),
      ].map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        ...(c.url ? { item: c.url } : {}),
      })),
    },
  ];

  return (
    <>
      <Seo
        title={heading}
        description={sub ? pick(sub.name) : cat ? pick(cat.name) : t.shop.sub}
        path={path}
        jsonLd={jsonLd}
      />
      <PageHero label={t.shop.label} title={heading} description={t.shop.sub} />
      <div className="container">
        <Breadcrumbs items={crumbs} />
      </div>

      <section className="section shop-layout">
        <div className="container shop-grid">
          <aside className="shop-sidebar">
            <Filters filters={filters} onChange={onChange} onClear={onClear} />
          </aside>

          <div className="shop-main">
            <nav
              className="shop-category-scroll"
              aria-label={pick({ en: 'Shop categories', ar: 'فئات المتجر' })}
            >
              <button
                type="button"
                className={!filters.category ? 'active' : ''}
                aria-current={!filters.category ? 'page' : undefined}
                onClick={() => navigate('/shop')}
              >
                {t.common.all}
              </button>
              {categories.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  className={filters.category === item.slug ? 'active' : ''}
                  aria-current={filters.category === item.slug ? 'page' : undefined}
                  onClick={() => navigate(`/shop/${item.slug}`)}
                >
                  {pick(item.name)}
                </button>
              ))}
            </nav>
            {cat && (
              <nav
                className="shop-subcategory-scroll"
                aria-label={pick({
                  en: `${pick(cat.name)} subcategories`,
                  ar: `فئات ${pick(cat.name)}`,
                })}
              >
                <button
                  type="button"
                  className={!filters.subcategory ? 'active' : ''}
                  aria-current={!filters.subcategory ? 'page' : undefined}
                  onClick={() => navigate(`/shop/${cat.slug}`)}
                >
                  {pick({ en: `All ${pick(cat.name)}`, ar: `كل ${pick(cat.name)}` })}
                </button>
                {cat.subcategories.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    className={filters.subcategory === item.slug ? 'active' : ''}
                    aria-current={filters.subcategory === item.slug ? 'page' : undefined}
                    onClick={() => navigate(`/shop/${cat.slug}/${item.slug}`)}
                  >
                    {pick(item.name)}
                  </button>
                ))}
              </nav>
            )}
            <div className="mobile-filter-pills" aria-label={t.common.filters}>
              <button
                type="button"
                onClick={(event) => {
                  filterTriggerRef.current = event.currentTarget;
                  openSheet('filter', '');
                }}
              >
                <Icon name="filter" /> {t.common.filters}
                {filters.sizes.length +
                  filters.colors.length +
                  Number(filters.inStock) +
                  Number(filters.newOnly) +
                  Number(filters.bestOnly) >
                  0 && (
                  <b>
                    {filters.sizes.length +
                      filters.colors.length +
                      Number(filters.inStock) +
                      Number(filters.newOnly) +
                      Number(filters.bestOnly)}
                  </b>
                )}
              </button>
              {filters.category !== 'accessories' && (
                <button
                  type="button"
                  onClick={(event) => {
                    filterTriggerRef.current = event.currentTarget;
                    openSheet('filter', 'size');
                  }}
                >
                  {t.shop.sizeFilter}
                </button>
              )}
              <button
                type="button"
                onClick={(event) => {
                  filterTriggerRef.current = event.currentTarget;
                  openSheet('filter', 'color');
                }}
              >
                {t.shop.colorFilter}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  filterTriggerRef.current = event.currentTarget;
                  openSheet('filter', 'price');
                }}
              >
                {t.shop.priceRange}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  filterTriggerRef.current = event.currentTarget;
                  openSheet('filter', 'availability');
                }}
              >
                {t.shop.availability}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  sortTriggerRef.current = event.currentTarget;
                  openSheet('sort');
                }}
              >
                {t.shop.sortBy}
              </button>
            </div>
            <div className="shop-toolbar">
              <button
                type="button"
                className="btn-secondary compact shop-filter-btn"
                onClick={(event) => {
                  filterTriggerRef.current = event.currentTarget;
                  openSheet('filter');
                }}
              >
                {t.shop.openFilters}
              </button>
              <p className="shop-count">
                {filtered.length} {filtered.length === 1 ? t.common.result : t.common.results}
              </p>
              <SortSelect
                value={sort}
                onChange={(v) =>
                  updateParams((p) => (v === 'featured' ? p.delete('sort') : p.set('sort', v)))
                }
              />
            </div>

            {filtered.length > 0 ? (
              <div className="product-grid">
                {filtered.flatMap((p) =>
                  p.colors.length > 1
                    ? p.colors.map((c) => ({ product: p, color: c.key }))
                    : [{ product: p, color: p.colors[0]?.key }],
                ).map(({ product: p, color }, i) => (
                  <ProductCard key={`${p.id}-${color || 'default'}`} product={p} displayColor={color} eager={i < 4} />
                ))}
              </div>
            ) : (
              <EmptyState
                message={t.shop.empty}
                hint={t.shop.emptyHint}
                action={{ label: t.common.clearAll, onClick: onClear }}
              />
            )}
          </div>
        </div>
      </section>

      {/* Mobile filters drawer is portalled to body so transformed page ancestors cannot hide it. */}
      {mobileOpen &&
        createPortal(
          <div
            className={`filters-drawer${mobileOpen ? ' open' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={t.common.filters}
            hidden={!mobileOpen}
          >
            <div
              className="filters-drawer-backdrop"
              onClick={() =>
                window.history.state?.lhaSheet ? window.history.back() : closeSheets()
              }
            />
            <div ref={filterPanelRef} className="filters-drawer-panel mobile-filter-sheet">
              <div className="filters-drawer-head">
                {mobileGroup && (
                  <button
                    type="button"
                    className="sheet-back"
                    onClick={() => setMobileGroup('')}
                    aria-label={pick({ en: 'Back', ar: 'رجوع' })}
                  >
                    <Icon name="back" />
                  </button>
                )}
                <h2>
                  {mobileGroup
                    ? {
                        size: t.shop.sizeFilter,
                        color: t.shop.colorFilter,
                        price: t.shop.priceRange,
                        availability: t.shop.availability,
                      }[mobileGroup]
                    : t.common.filters}
                </h2>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => {
                    window.history.state?.lhaSheet ? window.history.back() : closeSheets();
                  }}
                  aria-label={t.common.close}
                >
                  <Icon name="close" />
                </button>
              </div>
              {!mobileGroup && (
                <div className="filter-group-list">
                  {[
                    ...(filters.category === 'accessories'
                      ? []
                      : [['size', t.shop.sizeFilter, filters.sizes.join(', ')]]),
                    [
                      'color',
                      t.shop.colorFilter,
                      filters.colors
                        .map((key) => pick(allColors.find((c) => c.key === key)?.name))
                        .filter(Boolean)
                        .join(', '),
                    ],
                    [
                      'price',
                      t.shop.priceRange,
                      filters.priceMin || filters.priceMax
                        ? `${filters.priceMin || '0'}–${filters.priceMax || '∞'}`
                        : '',
                    ],
                    [
                      'availability',
                      t.shop.availability,
                      [
                        filters.inStock && t.shop.inStock,
                        filters.newOnly && t.shop.newOnly,
                        filters.bestOnly && t.shop.bestOnly,
                      ]
                        .filter(Boolean)
                        .join(', '),
                    ],
                  ].map(([key, label, summary]) => (
                    <button key={key} type="button" onClick={() => setMobileGroup(key)}>
                      <span>
                        <strong>{label}</strong>
                        {summary && <small>{summary}</small>}
                      </span>
                      <Icon name="chevron" className="chevron-side" />
                    </button>
                  ))}
                </div>
              )}
              {mobileGroup === 'size' && (
                <div className="sheet-option-grid">
                  {allSizes.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={mobilePreviewFilters.sizes.includes(value) ? 'selected' : ''}
                      aria-pressed={mobilePreviewFilters.sizes.includes(value)}
                      onClick={() => {
                        const next = new Set(mobilePreviewFilters.sizes);
                        next.has(value) ? next.delete(value) : next.add(value);
                        setMobileDraft((draft) => ({ ...draft, sizes: [...next] }));
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              )}
              {mobileGroup === 'color' && (
                <div className="sheet-color-list">
                  {allColors.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={mobilePreviewFilters.colors.includes(item.key) ? 'selected' : ''}
                      aria-pressed={mobilePreviewFilters.colors.includes(item.key)}
                      onClick={() => {
                        const next = new Set(mobilePreviewFilters.colors);
                        next.has(item.key) ? next.delete(item.key) : next.add(item.key);
                        setMobileDraft((draft) => ({ ...draft, colors: [...next] }));
                      }}
                    >
                      <span className="swatch-dot" style={{ background: item.hex }} />
                      {pick(item.name)}
                    </button>
                  ))}
                </div>
              )}
              {mobileGroup === 'price' && (
                <div className="sheet-radio-list">
                  {[
                    ['', '', pick({ en: 'All prices', ar: 'كل الأسعار' })],
                    ['0', '25', '$0–$25'],
                    ['25', '50', '$25–$50'],
                    ['50', '100', '$50–$100'],
                    ['100', '', '$100+'],
                  ].map(([min, max, label]) => (
                    <button
                      key={`${min}-${max}`}
                      type="button"
                      className={
                        mobilePreviewFilters.priceMin === min &&
                        mobilePreviewFilters.priceMax === max
                          ? 'selected'
                          : ''
                      }
                      onClick={() =>
                        setMobileDraft((draft) => ({ ...draft, priceMin: min, priceMax: max }))
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              {mobileGroup === 'availability' && (
                <div className="sheet-toggle-list">
                  {[
                    ['inStock', t.shop.inStock],
                    ['newOnly', t.shop.newOnly],
                    ['bestOnly', t.shop.bestOnly],
                  ].map(([key, label]) => (
                    <label key={key}>
                      <span>{label}</span>
                      <input
                        type="checkbox"
                        checked={mobilePreviewFilters[key]}
                        onChange={(event) =>
                          setMobileDraft((draft) => ({ ...draft, [key]: event.target.checked }))
                        }
                      />
                    </label>
                  ))}
                </div>
              )}
              <div className="filter-sheet-actions">
                <button
                  type="button"
                  className="filters-clear"
                  onClick={() =>
                    setMobileDraft({
                      sizes: [],
                      colors: [],
                      priceMin: '',
                      priceMax: '',
                      inStock: false,
                      newOnly: false,
                      bestOnly: false,
                    })
                  }
                >
                  {t.common.clearAll}
                </button>
                <button
                  type="button"
                  className="btn-primary block"
                  onClick={() => {
                    if (mobileDraft) onChange(mobileDraft);
                    window.history.state?.lhaSheet ? window.history.back() : closeSheets();
                  }}
                >
                  {mobilePreviewCount}{' '}
                  {mobilePreviewCount === 1 ? t.common.result : t.common.results}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
      {sortOpen &&
        createPortal(
          <div
            className={`filters-drawer sort-sheet${sortOpen ? ' open' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={t.shop.sortBy}
            hidden={!sortOpen}
          >
            <div
              className="filters-drawer-backdrop"
              onClick={() =>
                window.history.state?.lhaSheet ? window.history.back() : closeSheets()
              }
            />
            <div ref={sortPanelRef} className="filters-drawer-panel mobile-filter-sheet">
              <div className="filters-drawer-head">
                <h2>{t.shop.sortBy}</h2>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => {
                    window.history.state?.lhaSheet ? window.history.back() : closeSheets();
                  }}
                  aria-label={t.common.close}
                >
                  <Icon name="close" />
                </button>
              </div>
              <div className="sheet-radio-list" role="radiogroup">
                {SORT_OPTIONS.map((value) => {
                  const labels = {
                    featured: t.shop.sortFeatured,
                    newest: t.shop.sortNewest,
                    'price-asc': t.shop.sortPriceAsc,
                    'price-desc': t.shop.sortPriceDesc,
                    'name-asc': t.shop.sortNameAsc,
                    'name-desc': t.shop.sortNameDesc,
                  };
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={sort === value}
                      className={sort === value ? 'selected' : ''}
                      onClick={() => {
                        updateParams((p) =>
                          value === 'featured' ? p.delete('sort') : p.set('sort', value),
                        );
                        window.history.state?.lhaSheet ? window.history.back() : closeSheets();
                      }}
                    >
                      {labels[value]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
