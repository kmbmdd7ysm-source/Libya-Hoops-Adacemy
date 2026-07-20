import { useLanguage } from '../context/LanguageContext';
import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import Breadcrumbs from '../components/common/Breadcrumbs';
import CoachCard from '../components/coaches/CoachCard';
import EmptyState from '../components/common/EmptyState';
import { availableCoaches } from '../data/coaches';

export default function CoachesPage() {
  const { t } = useLanguage();
  const coaches = availableCoaches();

  return (
    <>
      <Seo title={t.coaches.title} description={t.coaches.sub} path="/coaches" />
      <PageHero label={t.coaches.label} title={t.coaches.title} description={t.coaches.sub} />
      <div className="container">
        <Breadcrumbs items={[{ label: t.coaches.title }]} />
      </div>

      <section className="section">
        <div className="container">
          {coaches.length > 0 ? (
            <div className="card-grid card-grid--4">
              {coaches.map((c) => (
                <CoachCard key={c.slug} coach={c} />
              ))}
            </div>
          ) : (
            <EmptyState
              message={t.coaches.empty}
              action={{ label: t.common.contactUs, to: '/contact' }}
            />
          )}
        </div>
      </section>
    </>
  );
}
