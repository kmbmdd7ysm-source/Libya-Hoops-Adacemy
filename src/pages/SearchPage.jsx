import { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import ProductCard from '../components/shop/ProductCard';
import ProgramCard from '../components/programs/ProgramCard';
import EventCard from '../components/events/EventCard';
import TrainingCard from '../components/training/TrainingCard';
import CoachCard from '../components/coaches/CoachCard';
import EmptyState from '../components/common/EmptyState';
import { searchSite, searchFacets } from '../utils/search';
export default function SearchPage() {
  const { t, pick, lang } = useLanguage(),
    [params, setParams] = useSearchParams(),
    [query, setQuery] = useState(params.get('q') || ''),
    [types, setTypes] = useState([]),
    [colors, setColors] = useState([]),
    [ages, setAges] = useState([]);
  useEffect(() => setQuery(params.get('q') || ''), [params]);
  const R = useMemo(
      () => searchSite(query, 999, { types, colors, ages }),
      [query, types, colors, ages],
    ),
    toggle = (v, set) => set((a) => (a.includes(v) ? a.filter((x) => x !== v) : [...a, v])),
    L = {
      products: lang === 'ar' ? 'الملابس والمنتجات' : 'Products',
      programs: t.search.programs,
      events: t.search.events,
      training: t.search.training,
      coaches: t.search.coaches,
      pages: t.search.pages,
    };
  return (
    <>
      <Seo title={t.search.title} description={t.search.title} path="/search" noindex />
      <PageHero label={t.search.label} title={t.search.title}>
        <form
          className="search-page-form"
          onSubmit={(e) => {
            e.preventDefault();
            setParams(query.trim() ? { q: query.trim() } : {});
          }}
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search.placeholder}
          />
          <button className="btn-primary compact">{t.common.search}</button>
        </form>
      </PageHero>
      <section className="section">
        <div className="container search-layout">
          <aside className="search-facets">
            <div className="filter-head">
              <strong>{lang === 'ar' ? 'تصفية النتائج' : 'Filter Results'}</strong>
              <button
                onClick={() => {
                  setTypes([]);
                  setColors([]);
                  setAges([]);
                }}
              >
                {t.common.clearAll}
              </button>
            </div>
            <Facet
              title={lang === 'ar' ? 'القسم' : 'Category'}
              vals={searchFacets.types}
              active={types}
              toggle={(v) => toggle(v, setTypes)}
              labels={L}
            />
            <Facet
              title={lang === 'ar' ? 'العمر' : 'Age'}
              vals={searchFacets.ages}
              active={ages}
              toggle={(v) => toggle(v, setAges)}
            />
            <Facet
              title={lang === 'ar' ? 'اللون' : 'Color'}
              vals={searchFacets.colors}
              active={colors}
              toggle={(v) => toggle(v, setColors)}
            />
          </aside>
          <main>
            {!query.trim() && !types.length && !colors.length && !ages.length ? (
              <EmptyState message={t.search.typeToSearch} />
            ) : R.total === 0 ? (
              <EmptyState message={t.search.noResults} />
            ) : (
              <div className="search-results">
                <p className="shop-count">
                  {R.total} {t.common.results}
                </p>
                {R.products.length > 0 && (
                  <G title={t.search.products}>
                    <div className="product-grid">
                      {R.products.map((x) => (
                        <ProductCard key={x.id} product={x} />
                      ))}
                    </div>
                  </G>
                )}
                {R.programs.length > 0 && (
                  <G title={t.search.programs}>
                    <div className="card-grid card-grid--3">
                      {R.programs.map((x) => (
                        <ProgramCard key={x.id} program={x} />
                      ))}
                    </div>
                  </G>
                )}
                {R.events.length > 0 && (
                  <G title={t.search.events}>
                    <div className="card-grid card-grid--3">
                      {R.events.map((x) => (
                        <EventCard key={x.id} event={x} />
                      ))}
                    </div>
                  </G>
                )}
                {R.training.length > 0 && (
                  <G title={t.search.training}>
                    <div className="card-grid card-grid--3">
                      {R.training.map((x) => (
                        <TrainingCard key={x.id} program={x} />
                      ))}
                    </div>
                  </G>
                )}
                {R.coaches.length > 0 && (
                  <G title={t.search.coaches}>
                    <div className="card-grid card-grid--4">
                      {R.coaches.map((x) => (
                        <CoachCard key={x.slug} coach={x} />
                      ))}
                    </div>
                  </G>
                )}
                {R.pages.length > 0 && (
                  <G title={t.search.pages}>
                    <ul className="search-pages">
                      {R.pages.map((x) => (
                        <li key={x.to}>
                          <Link to={x.to}>{pick(x.title)}</Link>
                        </li>
                      ))}
                    </ul>
                  </G>
                )}
              </div>
            )}
          </main>
        </div>
      </section>
    </>
  );
}
function Facet({ title, vals, active, toggle, labels = {} }) {
  return (
    <fieldset>
      <legend>{title}</legend>
      {vals.map((v) => (
        <label key={v}>
          <input type="checkbox" checked={active.includes(v)} onChange={() => toggle(v)} />
          <span>{labels[v] || v}</span>
        </label>
      ))}
    </fieldset>
  );
}
function G({ title, children }) {
  return (
    <section className="search-group">
      <h2 className="section-title">{title}</h2>
      {children}
    </section>
  );
}
