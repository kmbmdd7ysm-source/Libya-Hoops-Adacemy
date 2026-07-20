import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { SITE } from '../config';
import Seo from '../components/common/Seo';
import Breadcrumbs from '../components/common/Breadcrumbs';
import SmartImage from '../components/common/SmartImage';
import { getCoach } from '../data/coaches';
import NotFoundPage from './NotFoundPage';

export default function CoachProfilePage() {
  const { slug } = useParams();
  const { t, pick } = useLanguage();
  const coach = getCoach(slug);

  if (!coach) return <NotFoundPage />;

  const crumbs = [{ label: t.coaches.title, to: '/coaches' }, { label: pick(coach.name) }];

  const langs = pick(coach.languages);
  const facts = [
    coach.role && { label: t.coaches.role, value: pick(coach.role) },
    coach.nationality && { label: t.coaches.nationality, value: pick(coach.nationality) },
    coach.organization &&
      pick(coach.organization) && {
        label: t.coaches.organization,
        value: pick(coach.organization),
      },
    coach.experienceYears
      ? { label: t.coaches.experience, value: `${coach.experienceYears} ${t.coaches.years}` }
      : null,
    Array.isArray(langs) &&
      langs.length > 0 && { label: t.coaches.languages, value: langs.join(', ') },
  ].filter(Boolean);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: pick(coach.name),
      jobTitle: coach.role ? pick(coach.role) : undefined,
      worksFor: { '@type': 'Organization', name: SITE.name, url: SITE.domain },
      ...(coach.image ? { image: `${SITE.domain}${coach.image}` } : {}),
    },
  ];

  const listBlock = (title, field) => {
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

  return (
    <>
      <Seo
        title={pick(coach.name)}
        description={pick(coach.bio) || pick(coach.role)}
        path={`/coaches/${coach.slug}`}
        image={coach.image}
        type="profile"
        jsonLd={jsonLd}
      />
      <div className="container">
        <Breadcrumbs items={crumbs} />
      </div>

      <section className="section detail-hero">
        <div className="container detail-hero-grid">
          <div className="detail-media">
            <SmartImage
              src={coach.image}
              alt={pick(coach.name)}
              eager
              className="detail-image coach-portrait"
            />
          </div>
          <div className="detail-intro">
            <p className="section-label">{t.coaches.label}</p>
            <h1 className="detail-title">{pick(coach.name)}</h1>
            {coach.role && <p className="lead">{pick(coach.role)}</p>}
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
            <Link to="/contact?type=coaching" className="btn-primary block">
              {t.coaches.contact}
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container detail-body">
          {coach.bio && (
            <div className="detail-copy">
              <h2 className="section-title">{t.coaches.bio}</h2>
              <p>{pick(coach.bio)}</p>
            </div>
          )}
          <div className="detail-lists">
            {coach.philosophy && (
              <div className="detail-list-block">
                <h3>{t.coaches.philosophy}</h3>
                <p>{pick(coach.philosophy)}</p>
              </div>
            )}
            {listBlock(t.coaches.experience, coach.experience)}
            {listBlock(t.coaches.achievements, coach.achievements)}
            {listBlock(t.coaches.certifications, coach.certifications)}
            {listBlock(t.coaches.specialties, coach.specialties)}
          </div>
        </div>
      </section>
    </>
  );
}
