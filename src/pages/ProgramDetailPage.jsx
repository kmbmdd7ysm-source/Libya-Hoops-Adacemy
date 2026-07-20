import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { SITE } from '../config';
import Seo from '../components/common/Seo';
import Breadcrumbs from '../components/common/Breadcrumbs';
import SmartImage from '../components/common/SmartImage';
import ShareButtons from '../components/common/ShareButtons';
import ProgramCard from '../components/programs/ProgramCard';
import { getProgram, relatedPrograms } from '../data/programs';
import NotFoundPage from './NotFoundPage';

export default function ProgramDetailPage() {
  const { slug } = useParams();
  const { t, pick } = useLanguage();
  const program = getProgram(slug);

  if (!program) return <NotFoundPage />;

  const crumbs = [{ label: t.programs.title, to: '/programs' }, { label: pick(program.name) }];
  const related = relatedPrograms(program);

  // List fields are stored as { en: [...], ar: [...] }; pick() returns the localized array.
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

  const facts = [
    program.ages && { label: t.programs.ages, value: pick(program.ages) },
    program.level && { label: t.programs.level, value: pick(program.level) },
    program.schedule && { label: t.programs.schedule, value: pick(program.schedule) },
    program.location && { label: t.programs.location, value: pick(program.location) },
  ].filter(Boolean);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: pick(program.name),
      description: pick(program.summary),
      provider: { '@type': 'Organization', name: SITE.name, sameAs: SITE.domain },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { name: t.nav.home, url: SITE.domain },
        { name: t.programs.title, url: `${SITE.domain}/programs` },
        { name: pick(program.name) },
      ].map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        ...(c.url ? { item: c.url } : {}),
      })),
    },
  ];

  return (
    <>
      <Seo
        title={pick(program.name)}
        description={pick(program.summary)}
        path={`/programs/${program.slug}`}
        image={program.image}
        jsonLd={jsonLd}
      />
      <div className="container">
        <Breadcrumbs items={crumbs} />
      </div>

      <section className="section detail-hero">
        <div className="container detail-hero-grid">
          <div className="detail-media">
            <SmartImage
              src={program.image}
              alt={pick(program.name)}
              eager
              className="detail-image"
            />
          </div>
          <div className="detail-intro">
            <p className="section-label">{t.programs.label}</p>
            <h1 className="detail-title">{pick(program.name)}</h1>
            <p className="lead">{pick(program.summary)}</p>
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
              <span className="inquiry-tag">{t.programs.inquiry}</span>
              <Link
                to={`/contact?type=program&program=${encodeURIComponent(program.slug)}`}
                className="btn-primary block"
              >
                {t.programs.contact}
              </Link>
            </div>
            <ShareButtons
              title={pick(program.name)}
              text={pick(program.summary)}
              label={t.common.share}
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container detail-body">
          <div className="detail-copy">
            <h2 className="section-title">{t.programs.overview}</h2>
            <p>{pick(program.description)}</p>
          </div>
          <div className="detail-lists">
            {renderList(t.programs.objectives, program.objectives)}
            {renderList(t.programs.skills, program.skills)}
            {renderList(t.programs.included, program.included)}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--muted">
          <div className="container">
            <h2 className="section-title">{t.programs.related}</h2>
            <div className="card-grid card-grid--3">
              {related.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
