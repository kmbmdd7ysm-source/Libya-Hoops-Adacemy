import { useLanguage } from '../../context/LanguageContext';
import { categories } from '../../data/categories';
import { allSizes, allColors } from '../../data/products';

// Presentational filters. State + URL sync handled by ShopPage.
export default function Filters({ filters, onChange, onClear }) {
  const { t, pick } = useLanguage();
  const activeCat = categories.find((c) => c.slug === filters.category);
  const subs = activeCat ? activeCat.subcategories : [];

  const toggleArray = (field, val) => {
    const set = new Set(filters[field]);
    if (set.has(val)) set.delete(val);
    else set.add(val);
    onChange({ [field]: Array.from(set) });
  };

  return (
    <div className="filters">
      <div className="filters-head">
        <h2 className="filters-title">{t.common.filters}</h2>
        <button type="button" className="filters-clear" onClick={onClear}>
          {t.common.clearAll}
        </button>
      </div>

      <fieldset className="filter-group">
        <legend>{t.shop.category}</legend>
        <label className="filter-radio">
          <input
            type="radio"
            name="cat"
            checked={!filters.category}
            onChange={() => onChange({ category: '', subcategory: '' })}
          />
          <span>{t.common.all}</span>
        </label>
        {categories.map((c) => (
          <label key={c.slug} className="filter-radio">
            <input
              type="radio"
              name="cat"
              checked={filters.category === c.slug}
              onChange={() => onChange({ category: c.slug, subcategory: '' })}
            />
            <span>{pick(c.name)}</span>
          </label>
        ))}
      </fieldset>

      {subs.length > 0 && (
        <fieldset className="filter-group">
          <legend>{t.shop.subcategory}</legend>
          <label className="filter-radio">
            <input
              type="radio"
              name="sub"
              checked={!filters.subcategory}
              onChange={() => onChange({ subcategory: '' })}
            />
            <span>{t.common.all}</span>
          </label>
          {subs.map((s) => (
            <label key={s.slug} className="filter-radio">
              <input
                type="radio"
                name="sub"
                checked={filters.subcategory === s.slug}
                onChange={() => onChange({ subcategory: s.slug })}
              />
              <span>{pick(s.name)}</span>
            </label>
          ))}
        </fieldset>
      )}

      {filters.category !== 'accessories' && (
        <fieldset className="filter-group">
          <legend>{t.shop.sizeFilter}</legend>
          <div className="filter-chips">
            {allSizes.map((s) => (
              <button
                key={s}
                type="button"
                className={`filter-chip${filters.sizes.includes(s) ? ' active' : ''}`}
                onClick={() => toggleArray('sizes', s)}
                aria-pressed={filters.sizes.includes(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="filter-group">
        <legend>{t.shop.colorFilter}</legend>
        <div className="filter-swatches">
          {allColors.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`filter-swatch${filters.colors.includes(c.key) ? ' active' : ''}`}
              onClick={() => toggleArray('colors', c.key)}
              aria-pressed={filters.colors.includes(c.key)}
              title={pick(c.name)}
              aria-label={pick(c.name)}
            >
              <span className="swatch-dot" style={{ background: c.hex }} />
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend>{t.shop.priceRange}</legend>
        <div className="price-range">
          <label>
            <span className="sr-only">{t.shop.min}</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              placeholder={t.shop.min}
              value={filters.priceMin}
              onChange={(e) => onChange({ priceMin: e.target.value })}
            />
          </label>
          <span aria-hidden="true">—</span>
          <label>
            <span className="sr-only">{t.shop.max}</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              placeholder={t.shop.max}
              value={filters.priceMax}
              onChange={(e) => onChange({ priceMax: e.target.value })}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend>{t.shop.availability}</legend>
        <label className="filter-check">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => onChange({ inStock: e.target.checked })}
          />
          <span>{t.shop.inStock}</span>
        </label>
        <label className="filter-check">
          <input
            type="checkbox"
            checked={filters.newOnly}
            onChange={(e) => onChange({ newOnly: e.target.checked })}
          />
          <span>{t.shop.newOnly}</span>
        </label>
        <label className="filter-check">
          <input
            type="checkbox"
            checked={filters.bestOnly}
            onChange={(e) => onChange({ bestOnly: e.target.checked })}
          />
          <span>{t.shop.bestOnly}</span>
        </label>
      </fieldset>
    </div>
  );
}
