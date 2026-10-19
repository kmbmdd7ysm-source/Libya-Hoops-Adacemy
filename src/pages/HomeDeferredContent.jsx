import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import SectionHeading from '../components/common/SectionHeading';
import ProductCard from '../components/shop/ProductCard';
import ProgramCard from '../components/programs/ProgramCard';
import TrainingCard from '../components/training/TrainingCard';
import { products, featuredProducts, newArrivals } from '../data/products';
import { featuredPrograms, enabledPrograms } from '../data/programs';
import { featuredTraining, onlineTraining } from '../data/onlineTraining';

export default function HomeDeferredContent() {
  const { t, pick } = useLanguage();

  const recommendedPrograms = featuredPrograms();
  const programs = (recommendedPrograms.length ? recommendedPrograms : enabledPrograms())
    .filter((program) => program.available !== false)
    .slice(0, 3);

  const availableTraining = onlineTraining.filter((program) => program.available !== false);
  const featuredTrainingIds = new Set(
    featuredTraining()
      .filter((program) => program.available !== false)
      .map((program) => program.id),
  );
  const training = [
    ...availableTraining.filter((program) => featuredTrainingIds.has(program.id)),
    ...availableTraining.filter((program) => !featuredTrainingIds.has(program.id)),
  ].slice(0, 3);

  // Homepage shelf must show products visitors can actually order.
  // The featured flag may also be used for upcoming collections.
  const availableGear = products.filter(
    (product) =>
      product.available !== false &&
      !product.comingSoon &&
      product.availability === 'in-stock' &&
      product.price > 0,
  );
  const featuredGear = featuredProducts().filter((product) => availableGear.includes(product));
  const arrivalGear = newArrivals().filter((product) => availableGear.includes(product));
  const gear = (
    featuredGear.length ? featuredGear : arrivalGear.length ? arrivalGear : availableGear
  ).slice(0, 4);

  return (
    <div className="home-deferred-content home-v2-deferred">
      {programs.length > 0 && (
        <section
          className="section home-v2-catalog-section"
          aria-labelledby="home-programs-heading"
        >
          <div className="container">
            <div id="home-programs-heading">
              <SectionHeading
                label={t.home.programsTitle}
                title={t.home.programsSub}
                link="/programs"
                linkLabel={t.common.viewAll}
              />
            </div>
            <div className="card-grid card-grid--3">
              {programs.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          </div>
        </section>
      )}

      {training.length > 0 && (
        <section
          className="section section--muted home-v2-catalog-section"
          aria-labelledby="home-online-heading"
        >
          <div className="container">
            <div id="home-online-heading">
              <SectionHeading
                label={t.home.trainingTitle}
                title={t.home.trainingSub}
                link="/online-training"
                linkLabel={t.common.viewAll}
              />
            </div>
            <div className="card-grid card-grid--3">
              {training.map((program) => (
                <TrainingCard key={program.id} program={program} />
              ))}
            </div>
          </div>
        </section>
      )}

      {gear.length > 0 && (
        <section className="section home-v2-catalog-section" aria-labelledby="home-store-heading">
          <div className="container">
            <div id="home-store-heading">
              <SectionHeading
                label={pick({ en: 'ACADEMY GEAR', ar: 'منتجات الأكاديمية' })}
                title={t.home.productsSub}
                link="/shop"
                linkLabel={t.common.viewAll}
              />
            </div>
            <div className="product-grid">
              {gear.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section academy-intro home-v2-about" aria-labelledby="home-about-title">
        <div className="container academy-grid">
          <div className="academy-copy">
            <p className="section-label">{t.home.academyTitle}</p>
            <h2 id="home-about-title" className="section-title">
              {t.home.philosophyTitle}
            </h2>
            <p className="lead">{t.home.academyText}</p>
            <p>{t.home.philosophyText}</p>
            <Link to="/about" className="btn-secondary block">
              {t.common.learnMore}
            </Link>
          </div>
          <div className="academy-values">
            {t.home.values.slice(0, 3).map((value, index) => (
              <div key={value[0]} className="value-card">
                <span className="value-index">0{index + 1}</span>
                <h3>{value[0]}</h3>
                <p>{value[1]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="section cta-band home-v2-cta"
        aria-label={pick({ en: 'Join the academy', ar: 'انضم إلى الأكاديمية' })}
      >
        <div className="container cta-inner">
          <p className="section-label">
            {pick({ en: 'THE NEXT STEP IS YOURS', ar: 'الخطوة الجاية عليك' })}
          </p>
          <h2 className="display-title">{t.home.ctaTitle}</h2>
          <p>{t.home.ctaText}</p>
          <div className="hero-actions">
            <Link to="/contact" className="btn-primary block">
              {t.common.joinAcademy}
            </Link>
            <Link to="/programs" className="btn-ghost block">
              {t.common.explorePrograms}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
