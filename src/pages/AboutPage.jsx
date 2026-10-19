import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import Breadcrumbs from '../components/common/Breadcrumbs';

export default function AboutPage() {
  const { t } = useLanguage();

  const blocks = [
    { title: t.about.whoTitle, text: t.about.whoText },
    { title: t.about.whyTitle, text: t.about.whyText },
    { title: t.about.missionTitle, text: t.about.missionText },
    { title: t.about.visionTitle, text: t.about.visionText },
    { title: t.about.philosophyTitle, text: t.about.philosophyText },
  ];

  return (
    <>
      <Seo title={t.about.title} description={t.about.lead} path="/about" />
      <PageHero label={t.about.label} title={t.about.title} description={t.about.lead} />
      <div className="container">
        <Breadcrumbs items={[{ label: t.about.title }]} />
      </div>

      <section className="section">
        <div className="container prose-grid">
          {blocks.map((b, i) => (
            <article key={i} className="prose-block">
              <h2 className="section-title">{b.title}</h2>
              <p>{b.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <h2 className="section-title">{t.about.valuesTitle}</h2>
          <div className="card-grid card-grid--3 values-grid">
            {t.about.values.map((v, i) => (
              <div key={i} className="value-card">
                <span className="value-index">0{i + 1}</span>
                <h3>{v[0]}</h3>
                <p>{v[1]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container prose-grid">
          <article className="prose-block">
            <h2 className="section-title">{t.about.communityTitle}</h2>
            <p>{t.about.communityText}</p>
          </article>
          <article className="prose-block">
            <h2 className="section-title">{t.about.globalTitle}</h2>
            <p>{t.about.globalText}</p>
          </article>
        </div>
      </section>

      <section className="section academy-about-story" aria-labelledby="academy-about-cta-title">
        <div className="container academy-about-story-grid">
          <div className="academy-about-story-image">
            <img src="/images/programs/youth-development.webp" alt="" width="1312" height="816"
              loading="lazy" decoding="async" />
          </div>
          <div className="academy-about-story-copy">
            <p className="section-label">{t.about.label}</p>
            <h2 className="section-title" id="academy-about-cta-title">
              {t.home.philosophyTitle}
            </h2>
            <p>{t.home.philosophyText}</p>
            <div className="academy-editorial-actions">
              <Link to="/programs" className="btn-primary">
                {t.common.explorePrograms}
              </Link>
              <Link to="/contact" className="btn-secondary">
                {t.common.contactUs}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section cta-band">
        <div className="container cta-inner">
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
    </>
  );
}
