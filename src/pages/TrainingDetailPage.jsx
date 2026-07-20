import { useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart, cartKey } from '../context/CartContext';
import { SITE } from '../config';
import { trackEvent } from '../utils/analytics';
import Seo from '../components/common/Seo';
import Breadcrumbs from '../components/common/Breadcrumbs';
import SmartImage from '../components/common/SmartImage';
import Price from '../components/common/Price';
import ShareButtons from '../components/common/ShareButtons';
import Accordion from '../components/common/Accordion';
import TrainingCard from '../components/training/TrainingCard';
import { getTraining, relatedTraining } from '../data/onlineTraining';
import NotFoundPage from './NotFoundPage';
import PurchaseActions from '../components/shop/PurchaseActions';
import { useWishlist } from '../hooks/useWishlist';

export default function TrainingDetailPage() {
  const { slug } = useParams();
  const { t, pick } = useLanguage();
  const { addItem } = useCart();
  const wishlist = useWishlist();
  const program = getTraining(slug);

  if (!program) return <NotFoundPage />;

  const comingSoon = program.available === false;
  const crumbs = [
    { label: t.training.title, to: '/online-training' },
    { label: pick(program.title) },
  ];
  const related = relatedTraining(program);

  const renderList = (title, field) => {
    const arr = pick(field);
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return (
      <div className="detail-list-block">
        <h3>{title}</h3>
        <ul className="tick-list">
          {arr.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      </div>
    );
  };

  const addToCart = () => {
    if (comingSoon) return;
    addItem({
      key: cartKey('training', program.id),
      type: 'training',
      fulfillmentType: 'digital_training',
      id: program.id,
      slug: program.slug,
      name: program.title,
      image: program.coverImage,
      price: program.price || 0,
      href: `/online-training/${program.slug}`,
      quantity: 1,
    });
    trackEvent('add_to_cart', {
      item_id: program.id,
      item_name: pick(program.title),
      value: program.price,
    });
  };

  const facts = [
    program.level && { label: t.training.level, value: pick(program.level) },
    program.recommendedAge && { label: t.training.age, value: pick(program.recommendedAge) },
    program.duration && { label: t.training.duration, value: pick(program.duration) },
    program.sessions && { label: t.training.sessions, value: String(program.sessions) },
    program.deliveryType && { label: t.training.delivery, value: pick(program.deliveryType) },
  ].filter(Boolean);

  const curriculum = Array.isArray(program.curriculum)
    ? program.curriculum.map((mod) => ({
        title: pick(mod.title),
        content: (
          <ul className="lesson-list">
            {(pick(mod.lessons) || []).map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        ),
      }))
    : [];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: pick(program.title),
      description: pick(program.description),
      provider: { '@type': 'Organization', name: SITE.name, sameAs: SITE.domain },
      ...(program.price
        ? {
            offers: {
              '@type': 'Offer',
              price: program.price,
              priceCurrency: SITE.currency,
              availability: comingSoon
                ? 'https://schema.org/PreOrder'
                : 'https://schema.org/InStock',
            },
          }
        : {}),
    },
  ];

  return (
    <>
      <Seo
        title={pick(program.title)}
        description={pick(program.description)}
        path={`/online-training/${program.slug}`}
        image={program.coverImage}
        jsonLd={jsonLd}
      />
      <div className="container">
        <Breadcrumbs items={crumbs} />
      </div>

      <section className="section detail-hero">
        <div className="container detail-hero-grid">
          <div className="detail-media">
            {program.trailerUrl ? (
              <div className="video-embed">
                <iframe
                  src={program.trailerUrl}
                  title={pick(program.title)}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <SmartImage
                src={program.coverImage}
                alt={pick(program.title)}
                eager
                className="detail-image"
              />
            )}
          </div>
          <div className="detail-intro">
            <p className="section-label">{t.training.label}</p>
            <h1 className="detail-title">{pick(program.title)}</h1>
            <p className="lead">{pick(program.description)}</p>
            {facts.length > 0 && (
              <dl className="fact-list">
                {facts.map((f, i) => (
                  <div key={i} className="fact">
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="detail-cta">
              <Price amount={program.price} compareAt={program.compareAt} size="lg" />
              {comingSoon ? (
                <span className="status-pill">{t.training.comingSoon}</span>
              ) : (
                <PurchaseActions
                  quantity={1}
                  showQuantity={false}
                  onAdd={addToCart}
                  favorite={wishlist.has(program.id)}
                  onFavorite={() => wishlist.toggle(program.id)}
                />
              )}
            </div>
            <ShareButtons
              title={pick(program.title)}
              text={pick(program.description)}
              label={t.common.share}
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container detail-body">
          <div className="detail-lists">
            {renderList(t.training.outcomes, program.outcomes)}
            {pick(program.forWho) && (
              <div className="detail-list-block">
                <h3>{t.training.forWho}</h3>
                <p>{pick(program.forWho)}</p>
              </div>
            )}
            {renderList(t.training.equipment, program.equipment)}
            {renderList(t.training.included, program.includedResources)}
          </div>

          {curriculum.length > 0 && (
            <div className="detail-copy">
              <h2 className="section-title">{t.training.curriculum}</h2>
              <Accordion items={curriculum} />
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--muted">
          <div className="container">
            <h2 className="section-title">{t.training.related}</h2>
            <div className="card-grid card-grid--3">
              {related.map((p) => (
                <TrainingCard key={p.id} program={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
