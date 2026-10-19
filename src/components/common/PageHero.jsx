import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const heroArtwork = [
  {
    test: /^\/shop(?:\/|$)/,
    src: '/images/categories/clothing-hero-player.webp',
    position: 'center 37%',
  },
  {
    test: /^\/online-training(?:\/|$)/,
    src: '/images/training/full-body-strength.webp',
    position: 'center 42%',
  },
  {
    test: /^\/programs(?:\/|$)/,
    src: '/images/programs/elite-development.webp',
    position: 'center 42%',
  },
  {
    test: /^\/about(?:\/|$)/,
    src: '/images/programs/youth-development.webp',
    position: 'center 44%',
  },
  { test: /^\/events(?:\/|$)/, src: '/images/programs/camps.webp', position: 'center 42%' },
  {
    test: /^\/coaches(?:\/|$)/,
    src: '/images/programs/guard-development.webp',
    position: 'center 42%',
  },
  {
    test: /^\/contact(?:\/|$)/,
    src: '/images/training/basketball-iq.webp',
    position: 'center 45%',
  },
];

// Visible hero copy is intentionally shorter than the detailed SEO copy below
// the fold. Preserve the original page descriptions in the metadata.
const heroIntros = [
  { test: /^\/shop(?:\/|$)/, en: 'Performance essentials. Everyday style.', ar: 'ملابس رياضية. ستايل كل يوم.' },
  { test: /^\/online-training(?:\/|$)/, en: 'Train anywhere. Get better every day.', ar: 'تدرّب من أي مكان. وتطوّر كل يوم.' },
  { test: /^\/programs(?:\/|$)/, en: 'Real basketball work starts here.', ar: 'التطور الحقيقي يبدأ في الملعب.' },
  { test: /^\/about(?:\/|$)/, en: 'Built in Libya. Made for the game.', ar: 'من ليبيا. ومن أجل اللعبة.' },
  { test: /^\/events(?:\/|$)/, en: 'The next opportunity starts with a plan.', ar: 'كل فرصة جديدة تبدأ بخطة.' },
  { test: /^\/coaches(?:\/|$)/, en: 'Stronger habits. Better players.', ar: 'عادات أفضل. لاعبين أقوى.' },
  { test: /^\/contact(?:\/|$)/, en: 'Your next step starts here.', ar: 'خطوتك الجاية تبدأ من هنا.' },
];

/**
 * Section-wide editorial art: existing academy project assets, not fabricated
 * event / coach portraits. Hero headlines and CTAs remain accessible HTML.
 * Product artwork keeps its original color, no non-brand colored gradients.
 */
export default function PageHero({ label, title, description, children }) {
  const { pathname } = useLocation();
  const { pick } = useLanguage();
  const media = heroArtwork.find(({ test }) => test.test(pathname));
  const editorial = heroIntros.find(({ test }) => test.test(pathname));
  const shortDescription = editorial ? pick(editorial) : description;

  return (
    <section className={`page-hero${media ? ' page-hero--media' : ''}`}>
      {media && (
        <div className="page-hero-media" aria-hidden="true">
          <img
            src={media.src}
            alt=""
            width="1312"
            height="816"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            style={{ objectPosition: media.position }}
          />
        </div>
      )}
      <div className="court-lines" aria-hidden="true" />
      <div className="container page-hero-inner">
        {label && <p className="section-label">{label}</p>}
        <h1 className="display-title">{title}</h1>
        {shortDescription && <p className="page-description">{shortDescription}</p>}
        {children}
      </div>
    </section>
  );
}
