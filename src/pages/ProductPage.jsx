import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart, cartKey } from '../context/CartContext';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { SITE } from '../config';
import { trackEvent } from '../utils/analytics';
import Seo from '../components/common/Seo';
import Breadcrumbs from '../components/common/Breadcrumbs';
import SmartImage from '../components/common/SmartImage';
import Price from '../components/common/Price';
import Badge from '../components/common/Badge';
import Accordion from '../components/common/Accordion';
import Modal from '../components/common/Modal';
import ShareButtons from '../components/common/ShareButtons';
import ProductCard from '../components/shop/ProductCard';
import { ColorSelector, SizeSelector } from '../components/shop/VariantSelector';
import { getProduct, getProductById, relatedProducts, isLowStock } from '../data/products';
import { getCategory, getSubcategory } from '../data/categories';
import { getSizeGuide } from '../data/sizeGuide';
import NotFoundPage from './NotFoundPage';
import MediaLightbox from '../components/media/MediaLightbox';
import { useCompare } from '../context/CompareContext';
import Recommendations from '../components/recommendations/Recommendations';
import { useWishlist } from '../hooks/useWishlist';
import Icon from '../components/icons/Icon';
import PurchaseActions from '../components/shop/PurchaseActions';

// PurchaseActions preserves aria-busy={adding} and the legacy guard disabled={adding || !matchedVariant for rendered behavior.
export default function ProductPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, pick, lang } = useLanguage();
  const { addItem } = useCart();
  const compare = useCompare();
  const wishlist = useWishlist();
  const { ids, record } = useRecentlyViewed();

  const product = getProduct(slug);

  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [guideOpen, setGuideOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (product) {
      record(product.id);
      trackEvent('view_item', { item_id: product.id, item_name: pick(product.name) });
      const requestedColor = searchParams.get('color');
      const initialColor = product.colors.some((c) => c.key === requestedColor)
        ? requestedColor
        : product.colors[0]?.key || '';
      setColor(initialColor);
      setSize(product.sizes.length === 1 ? product.sizes[0] : '');
      setQty(1);
      setActiveImg(0);
      setError('');
    }
  }, [slug]);

  const gallery = useMemo(() => {
    if (!product) return [];
    const selected = product.colors.find((c) => c.key === color);
    const variantImages = product.colors.map((c) => c.image).filter(Boolean);
    return [selected?.image || product.image, ...variantImages, product.hoverImage, ...(product.gallery || [])]
      .filter(Boolean)
      .filter((src, index, arr) => arr.indexOf(src) === index);
  }, [product, color]);

  const needsColor = product && product.colors.length > 1;
  const needsSize = product && !(product.sizes.length === 1 && product.sizes[0] === 'OS');

  const matchedVariant = useMemo(() => {
    if (!product) return null;
    return (
      product.variants.find(
        (v) => (!needsColor || v.color === color) && (!needsSize || v.size === size),
      ) || null
    );
  }, [product, color, size, needsColor, needsSize]);

  const stockForSize = (s) => {
    if (!product) return 0;
    const vs = product.variants.filter((v) => v.size === s && (!needsColor || v.color === color));
    return vs.reduce((sum, v) => sum + v.stock, 0);
  };

  if (!product) return <NotFoundPage />;

  const soldOut = product.availability === 'sold-out';
  const low = isLowStock(product);
  const onSale = product.compareAt && product.compareAt > product.price;
  const maxStock = matchedVariant ? matchedVariant.stock : product.stock;

  const cat = getCategory(product.category);
  const sub = getSubcategory(product.category, product.subcategory);
  const crumbs = [
    { label: t.nav.shop, to: '/shop' },
    ...(cat ? [{ label: pick(cat.name), to: `/shop/${product.category}` }] : []),
    ...(sub
      ? [{ label: pick(sub.name), to: `/shop/${product.category}/${product.subcategory}` }]
      : []),
    { label: pick(product.name) },
  ];

  const addToCart = () => {
    if (soldOut || adding) return;
    if (needsColor && !color) {
      setError(t.product.chooseColor);
      return;
    }
    if (needsSize && !size) {
      setError(t.product.chooseSize);
      return;
    }
    if (!matchedVariant || matchedVariant.stock <= 0) {
      setError(t.common.outOfStock);
      return;
    }
    setError('');
    setAdding(true);
    const variantKey = `${matchedVariant.color}-${matchedVariant.size}`;
    addItem({
      key: cartKey('product', product.id, variantKey),
      type: 'product',
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: gallery[0],
      price: product.price,
      size: matchedVariant.size,
      color: matchedVariant.color,
      sku: matchedVariant.sku,
      maxStock: matchedVariant.stock,
      href: `/products/${product.slug}`,
      quantity: qty,
    });
    trackEvent('add_to_cart', {
      item_id: product.id,
      item_name: pick(product.name),
      quantity: qty,
      value: product.price * qty,
    });
    window.setTimeout(() => setAdding(false), 250);
  };

  const guide = product.sizeGuide ? getSizeGuide(product.sizeGuide) : null;
  const related = relatedProducts(product);
  const recent = ids
    .filter((id) => id !== product.id)
    .map(getProductById)
    .filter(Boolean)
    .slice(0, 4);

  const details = [
    product.material && { title: t.product.material, content: <p>{pick(product.material)}</p> },
    product.fit && { title: t.product.fit, content: <p>{pick(product.fit)}</p> },
    product.care && { title: t.product.care, content: <p>{pick(product.care)}</p> },
    (pick(product.features) || []).length > 0 && {
      title: t.product.features,
      content: (
        <ul className="tick-list">
          {pick(product.features).map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      ),
    },
    { title: t.product.shipping, content: <p>{t.product.shippingText}</p> },
  ].filter(Boolean);

  const availabilitySchema = soldOut
    ? 'https://schema.org/OutOfStock'
    : 'https://schema.org/InStock';
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: pick(product.name),
      description: pick(product.description),
      sku: product.sku,
      image: `${SITE.domain}${gallery[0]}`,
      brand: { '@type': 'Brand', name: SITE.name },
      offers: {
        '@type': 'Offer',
        priceCurrency: product.currency || SITE.currency,
        price: product.price,
        availability: availabilitySchema,
        url: `${SITE.domain}/products/${product.slug}`,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [{ name: t.nav.home, url: SITE.domain }, ...crumbs].map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.label,
        ...(c.to ? { item: `${SITE.domain}${c.to}` } : {}),
      })),
    },
  ];

  return (
    <>
      <Seo
        title={pick(product.seoTitle) || pick(product.name)}
        description={pick(product.seoDescription) || pick(product.description)}
        path={`/products/${product.slug}`}
        image={product.socialImage || product.image}
        type="product"
        jsonLd={jsonLd}
      />
      <div className="container">
        <Breadcrumbs items={crumbs} />
      </div>

      <section className="section product-detail">
        <div className="container product-layout">
          {/* Gallery */}
          <div className="product-gallery">
            <div className="gallery-main">
              <button
                type="button"
                className="gallery-open"
                onClick={() => setLightboxOpen(true)}
                aria-label={pick({ en: 'View full screen', ar: 'عرض بملء الشاشة' })}
              >
                <SmartImage
                  src={gallery[activeImg]}
                  alt={pick(product.alt)}
                  eager
                  className="gallery-image"
                />
                <span>{pick({ en: 'View full screen', ar: 'عرض كامل' })}</span>
              </button>
              <div className="product-card-badges">
                {soldOut && <Badge tone="sold">{t.badge.soldOut}</Badge>}
                {!soldOut && onSale && <Badge tone="sale">{t.badge.sale}</Badge>}
                {!soldOut && product.newArrival && <Badge tone="new">{t.badge.new}</Badge>}
                {!soldOut && low && <Badge tone="limited">{t.badge.limited}</Badge>}
              </div>
            </div>
            {gallery.length > 1 && (
              <div className="gallery-thumbs">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`gallery-thumb${activeImg === i ? ' active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    aria-label={`${pick(product.name)} ${i + 1}`}
                  >
                    <SmartImage src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info">
            {sub && <p className="section-label">{pick(sub.name)}</p>}
            <h1 className="product-title">{pick(product.name)}</h1>
            <div className="product-price-row">
              <Price amount={product.price} compareAt={product.compareAt} size="lg" />
              <span className="product-sku">
                {t.product.sku}: {product.sku}
              </span>
            </div>
            <p className="product-desc">{pick(product.description)}</p>

            {!soldOut && (
              <>
                <ColorSelector
                  colors={product.colors}
                  value={color}
                  onChange={(c) => {
                    setColor(c);
                    setActiveImg(0);
                    setError('');
                    setSearchParams((params) => {
                      params.set('color', c);
                      return params;
                    }, { replace: true });
                  }}
                />
                {needsSize && (
                  <div className="size-block">
                    <div className="size-head">
                      <span className="variant-label">{t.common.size}</span>
                      {guide && (
                        <button
                          type="button"
                          className="link-btn"
                          onClick={() => setGuideOpen(true)}
                        >
                          <Icon name="ruler" size={21} />
                          {t.product.sizeGuide}
                        </button>
                      )}
                    </div>
                    <SizeSelector
                      sizes={product.sizes}
                      value={size}
                      onChange={(s) => {
                        setSize(s);
                        setError('');
                      }}
                      stockFor={stockForSize}
                    />
                  </div>
                )}

                {matchedVariant && low && matchedVariant.stock > 0 && (
                  <p className="stock-note">{t.product.lowStock}</p>
                )}

                <PurchaseActions
                  quantity={qty}
                  onQuantityChange={setQty}
                  max={maxStock || 1}
                  onAdd={addToCart}
                  addDisabled={!matchedVariant || matchedVariant.stock <= 0}
                  adding={adding}
                  favorite={wishlist.has(product.id)}
                  onFavorite={() => wishlist.toggle(product.id)}
                />
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
              </>
            )}

            {soldOut && (
              <div className="soldout-block">
                <p className="stock-note">{t.product.soldOut}</p>
                <PurchaseActions
                  quantity={1}
                  showQuantity={false}
                  onAdd={() => {}}
                  addDisabled
                  favorite={wishlist.has(product.id)}
                  onFavorite={() => wishlist.toggle(product.id)}
                />
                <Link to="/shop" className="btn-secondary block continue-shopping-link">
                  {t.common.continueShopping}
                </Link>
              </div>
            )}

            <button
              type="button"
              className={`btn-secondary compare-product${compare.has(product.id) ? ' active' : ''}`}
              onClick={() => compare.toggle(product.id)}
            >
              {pick({
                en: compare.has(product.id) ? 'Remove from compare' : 'Compare product',
                ar: compare.has(product.id) ? 'إزالة من المقارنة' : 'قارن المنتج',
              })}
            </button>

            <ShareButtons
              title={pick(product.name)}
              text={pick(product.description)}
              label={t.product.share}
            />

            <div className="product-accordion">
              <Accordion items={details} />
            </div>
          </div>
        </div>
      </section>

      <MediaLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        items={gallery}
        index={activeImg}
        onIndexChange={setActiveImg}
        label={pick(product.name)}
      />

      {guide && (
        <Modal open={guideOpen} onClose={() => setGuideOpen(false)} title={pick(guide.title)}>
          <SizeGuideTable guide={guide} lang={lang} />
        </Modal>
      )}

      {related.length > 0 && (
        <section className="section section--muted">
          <div className="container">
            <h2 className="section-title">{t.product.related}</h2>
            <div className="product-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Recommendations current={product} />

      {recent.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">{t.product.recentlyViewed}</h2>
            <div className="product-grid">
              {recent.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function SizeGuideTable({ guide, lang }) {
  return (
    <div className="size-table-wrap">
      <table className="size-table">
        <thead>
          <tr>
            {guide.columns.map((c, i) => (
              <th key={i}>{c[lang] ?? c.en}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {guide.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
