import { useLocation } from 'react-router-dom';

const heroArtwork = [
  { test: /^\/shop(?:\/|$)/, src: '/images/categories/clothing-hero-player.webp', position: 'center 37%' },
  { test: /^\/online-training(?:\/|$)/, src: '/images/training/full-body-strength.webp', position: 'center 42%' },
  { test: /^\/programs(?:\/|$)/, src: '/images/programs/elite-development.webp', position: 'center 42%' },
  { test: /^\/about(?:\/|$)/, src: '/images/programs/youth-development.webp', position: 'center 44%' },
  { test: /^\/events(?:\/|$)/, src: '/images/programs/camps.webp', position: 'center 42%' },
  { test: /^\/coaches(?:\/|$)/, src: '/images/programs/guard-development.webp', position: 'center 42%' },
  { test: /^\/contact(?:\/|$)/, src: '/images/training/basketball-iq.webp', position: 'center 45%' },
];

/**
 * Section-wide editorial art: existing academy project assets, not fabricated
 * event / coach portraits. Hero headlines and CTAs remain accessible HTML.
 * Product artwork keeps its original color, no non-brand colored gradients.
 */
export default function PageHero({ label, title, description, children }) {
  const { pathname } = useLocation();
  const media = heroArtwork.find(({ test }) => test.test(pathname));

  return (
    <section className={`page-hero${media ? ' page-hero--media' : ''}`}>
      {media && (
        <div className="page-hero-media" aria-hidden="true">
          <img src={media.src} alt="" width="1312" height="816"
            loading="eager" fetchPriority="high" decoding="async"
            style={{ objectPosition: media.position }} />
        </div>
      )}
      <div className="court-lines" aria-hidden="true" />
      <div className="container page-hero-inner">
        {label && <p className="section-label">{label}</p>}
        <h1 className="display-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
        {children}
      </div>
    </section>
  );
}
