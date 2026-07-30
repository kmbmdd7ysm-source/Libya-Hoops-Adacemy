import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import SectionHeading from '../components/common/SectionHeading';
import CategoryCard from '../components/shop/CategoryCard';
import ProductCard from '../components/shop/ProductCard';
import ProgramCard from '../components/programs/ProgramCard';
import EventCard from '../components/events/EventCard';
import TrainingCard from '../components/training/TrainingCard';
import CoachCard from '../components/coaches/CoachCard';
import EmptyState from '../components/common/EmptyState';
import Recommendations from '../components/recommendations/Recommendations';
import { categories } from '../data/categories';
import { featuredProducts, newArrivals } from '../data/products';
import { featuredPrograms, enabledPrograms } from '../data/programs';
import { upcomingEvents } from '../data/events';
import { featuredTraining, onlineTraining } from '../data/onlineTraining';
import { availableCoaches } from '../data/coaches';

export default function HomeDeferredContent() {
  const { t, pick } = useLanguage();
  const cats = categories.slice(0, 2);
  const featuredGear = featuredProducts();
  const gear = (featuredGear.length ? featuredGear : newArrivals()).slice(0, 4);
  const featuredProgramList = featuredPrograms();
  const progs = (featuredProgramList.length ? featuredProgramList : enabledPrograms()).slice(0, 3);
  const events = upcomingEvents().slice(0, 3);
  const featuredTrainingList = featuredTraining();
  const training = (featuredTrainingList.length ? featuredTrainingList : onlineTraining).slice(0, 3);
  const coaches = availableCoaches();

  return (
    <div className="home-deferred-content">
      <section className="section">
        <div className="container">
          <SectionHeading
            label={t.home.categoriesTitle}
            title={t.home.categoriesSub}
            link="/shop"
            linkLabel={t.common.viewAll}
          />
          <div className="category-grid">
            {cats.map((category, index) => (
              <CategoryCard
                key={category.slug}
                to={`/shop/${category.slug}`}
                name={pick(category.name)}
                image={category.image}
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
            {t.home.values.map((value, index) => (
              <div key={index} className="value-card">
                <span className="value-index">0{index + 1}</span>
                <h3>{value[0]}</h3>
                <p>{value[1]}</p>
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
              {progs.map((program) => (
                <ProgramCard key={program.id} program={program} />
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
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
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
              {training.map((program) => (
                <TrainingCard key={program.id} program={program} />
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
              {gear.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <SectionHeading label={t.home.journeyTitle} title={t.home.journeySub} align="center" />
          <ol className="journey">
            {t.home.journey.map((step, index) => (
              <li key={index} className="journey-step">
                <span className="journey-num">0{index + 1}</span>
                <h3>{step[0]}</h3>
                <p>{step[1]}</p>
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
              {coaches.map((coach) => (
                <CoachCard key={coach.slug} coach={coach} />
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
    </div>
  );
}
