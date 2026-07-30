import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { SITE } from '../config';
import Seo, { organizationSchema } from '../components/common/Seo';
import SectionHeading from '../components/common/SectionHeading';
import CategoryCard from '../components/shop/CategoryCard';
import ProductCard from '../components/shop/ProductCard';
import ProgramCard from '../components/programs/ProgramCard';
import EventCard from '../components/events/EventCard';
import TrainingCard from '../components/training/TrainingCard';
import CoachCard from '../components/coaches/CoachCard';
import EmptyState from '../components/common/EmptyState';
import { categories } from '../data/categories';
import { featuredProducts, newArrivals } from '../data/products';
import { featuredPrograms, enabledPrograms } from '../data/programs';
import { upcomingEvents } from '../data/events';
import { featuredTraining, onlineTraining } from '../data/onlineTraining';
import { availableCoaches } from '../data/coaches';
import CinematicHero from '../components/experience/CinematicHero';
import Recommendations from '../components/recommendations/Recommendations';

export default function HomePage() {
  const { t, pick } = useLanguage();
  const cats = categories.slice(0, 2);
  const gear = (featuredProducts().length ? featuredProducts() : newArrivals()).slice(0, 4);
  const progs = (featuredPrograms().length ? featuredPrograms() : enabledPrograms()).slice(0, 3);
  const events = upcomingEvents().slice(0, 3);
  const training = (featuredTraining().length ? featuredTraining() : onlineTraining).slice(0, 3);
  const coaches = availableCoaches();

  const stats = [
    [
      { en: 'Elite', ar: 'نخبة' },
      { en: 'Player Development', ar: 'تطوير اللاعبين' },
    ],
    [
      { en: '360°', ar: '360°' },
      { en: 'Complete Training', ar: 'تدريب متكامل' },
    ],
    [
      { en: 'Libya', ar: 'ليبيا' },
      { en: 'Built for the Future', ar: 'نبني للمستقبل' },
    ],
    [
      { en: 'LHA', ar: 'LHA' },
      { en: 'Own The Game', ar: 'امتلك اللعبة' },
    ],
  ];

  return (
    <>
      <Seo
        title={`${SITE.name} — ${pick(SITE.slogan)}`}
        description={t.home.heroText}
        path="/"
        jsonLd={organizationSchema()}
      />

      <CinematicHero />

      <section
        id="home-story"
        className="brand-proof"
        aria-label={pick({ en: 'Academy promise', ar: 'وعد الأكاديمية' })}
      >
        <div className="container brand-proof-grid">
          <p>
            {pick({
              en: 'Built in Libya. Designed for the world.',
              ar: 'نبني في ليبيا. وننافس العالم.',
            })}
          </p>
          <span>
            {pick({ en: 'DEVELOPMENT · PERFORMANCE · CULTURE', ar: 'تطوير · أداء · ثقافة' })}
          </span>
        </div>
      </section>

      <section className="performance-strip" aria-label="Academy highlights">
        <div className="container performance-grid">
          {stats.map(([value, label]) => (
            <div className="performance-item" key={value.en}>
              <strong>{pick(value)}</strong>
              <span>{pick(label)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            label={t.home.categoriesTitle}
            title={t.home.categoriesSub}
            link="/shop"
            linkLabel={t.common.viewAll}
          />
          <div className="category-grid">
            {cats.map((c, index) => (
              <CategoryCard
                key={c.slug}
                to={`/shop/${c.slug}`}
                name={pick(c.name)}
                image={c.image}
                eager={index === 0}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section academy-intro">
        <div className="container academy-grid">
          <div className="academy-copy">
            <p className="section-label">{t.home.academyTitle}</p>
            <h2 className="section-title">{t.home.philosophyTitle}</h2>
            <p className="lead">{t.home.academyText}</p>
            <p>{t.home.philosophyText}</p>
            <Link to="/about" className="btn-secondary block">
              {t.common.learnMore}
            </Link>
          </div>
          <div className="academy-values">
            {t.home.values.map((v, i) => (
              <div key={i} className="value-card">
                <span className="value-index">0{i + 1}</span>
                <h3>{v[0]}</h3>
                <p>{v[1]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {progs.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeading
              label={t.home.programsTitle}
              title={t.home.programsSub}
              link="/programs"
              linkLabel={t.common.viewAll}
            />
            <div className="card-grid card-grid--3">
              {progs.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
          </div>
        </section>
      )}
      {events.length > 0 && (
        <section className="section section--muted">
          <div className="container">
            <SectionHeading
              label={t.home.eventsTitle}
              title={t.home.eventsSub}
              link="/events"
              linkLabel={t.common.viewAll}
            />
            <div className="card-grid card-grid--3">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        </section>
      )}
      {training.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeading
              label={t.home.trainingTitle}
              title={t.home.trainingSub}
              link="/online-training"
              linkLabel={t.common.viewAll}
            />
            <div className="card-grid card-grid--3">
              {training.map((p) => (
                <TrainingCard key={p.id} program={p} />
              ))}
            </div>
          </div>
        </section>
      )}
      {gear.length > 0 && (
        <section className="section section--muted">
          <div className="container">
            <SectionHeading
              label={t.home.productsTitle}
              title={t.home.productsSub}
              link="/shop"
              linkLabel={t.common.viewAll}
            />
            <div className="product-grid">
              {gear.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <SectionHeading label={t.home.journeyTitle} title={t.home.journeySub} align="center" />
          <ol className="journey">
            {t.home.journey.map((s, i) => (
              <li key={i} className="journey-step">
                <span className="journey-num">0{i + 1}</span>
                <h3>{s[0]}</h3>
                <p>{s[1]}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <SectionHeading label={t.home.coachesTitle} title={t.home.coachesSub} />
          {coaches.length > 0 ? (
            <div className="card-grid card-grid--4">
              {coaches.map((c) => (
                <CoachCard key={c.slug} coach={c} />
              ))}
            </div>
          ) : (
            <EmptyState message={t.home.coachesEmpty} />
          )}
        </div>
      </section>

      <Recommendations />

      <section className="section cta-band">
        <div className="container cta-inner">
          <h2 className="display-title">{t.home.ctaTitle}</h2>
          <p>{t.home.ctaText}</p>
          <div className="hero-actions">
            <Link to="/contact" className="btn-primary block">
              {t.common.joinAcademy}
            </Link>
            <Link to="/shop" className="btn-ghost block">
              {t.common.shopNow}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
