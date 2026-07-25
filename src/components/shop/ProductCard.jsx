import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useCart, cartKey } from '../../context/CartContext';
import { useWishlist } from '../../hooks/useWishlist';
import { isLowStock } from '../../data/products';
import SmartImage from '../common/SmartImage';
import Price from '../common/Price';
import Badge from '../common/Badge';
import { useCompare } from '../../context/CompareContext';
import Icon from '../icons/Icon';

export default function ProductCard({ product, eager = false, displayColor = null }) {
  const { t, pick } = useLanguage();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const compare = useCompare();
  const soldOut = product.availability === 'sold-out';
  const onSale = product.compareAt && product.compareAt > product.price;
  const low = isLowStock(product);
  const to = `/products/${product.slug}${displayColor ? `?color=${displayColor}` : ''}`;
  const cardColor = product.colors.find((c) => c.key === displayColor);
  const cardImage = cardColor?.image || product.image;

  const quickAdd = () => {
    if (soldOut) return;
    const variant = product.variants.find((v) => v.stock > 0);
    if (!variant) return;
    addItem({
      key: cartKey('product', product.id, `${variant.color}-${variant.size}`),
      type: 'product',
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: cardImage,
      price: product.price,
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
      maxStock: variant.stock,
      href: to,
      quantity: 1,
    });
  };

  return (
    <article className="product-card">
      <div className="product-card-media">
        <Link to={to} aria-label={pick(product.name)}>
          <SmartImage
            src={cardImage}
            alt={pick(product.alt)}
            className="product-card-img product-card-img--main"
            eager={eager}
          />
          {product.hoverImage && (
            <SmartImage
              src={product.hoverImage}
              alt=""
              className="product-card-img product-card-img--hover"
            />
          )}
        </Link>
        <div className="product-card-badges">
          {soldOut && <Badge tone="sold">{t.badge.soldOut}</Badge>}
          {!soldOut && onSale && <Badge tone="sale">{t.badge.sale}</Badge>}
          {!soldOut && product.newArrival && <Badge tone="new">{t.badge.new}</Badge>}
          {!soldOut && product.bestSeller && <Badge tone="best">{t.badge.best}</Badge>}
          {!soldOut && low && <Badge tone="limited">{t.badge.limited}</Badge>}
        </div>
        <button
          type="button"
          className={`wishlist-btn${has(product.id) ? ' active' : ''}`}
          onClick={() => toggle(product.id)}
          aria-pressed={has(product.id)}
          aria-label={has(product.id) ? t.a11y.removeWishlist : t.a11y.addWishlist}
        >
          <Icon name="heart" />
        </button>
        <button
          type="button"
          className={`compare-btn${compare.has(product.id) ? ' active' : ''}`}
          onClick={() => compare.toggle(product.id)}
          aria-pressed={compare.has(product.id)}
          aria-label={pick({ en: 'Compare product', ar: 'قارن المنتج' })}
        >
          <Icon name="compare" />
        </button>
        {!soldOut && (
          <button type="button" className="quick-add" onClick={quickAdd}>
            {t.common.quickAdd}
          </button>
        )}
      </div>
      <div className="product-card-body">
        <Link to={to} className="product-card-name">
          {pick(product.name)}
        </Link>
        <div className="product-card-meta">
          <Price amount={product.price} compareAt={product.compareAt} size="sm" />
          {product.colors.length > 1 && (
            <span className="color-dots" aria-hidden="true">
              {product.colors.slice(0, 4).map((c) => (
                <span key={c.key} className="color-dot" style={{ background: c.hex }} />
              ))}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
