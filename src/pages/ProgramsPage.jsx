import { useLanguage } from '../context/LanguageContext';
import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import Breadcrumbs from '../components/common/Breadcrumbs';
import ProgramCard from '../components/programs/ProgramCard';
import EmptyState from '../components/common/EmptyState';
import { enabledPrograms } from '../data/programs';

export default function ProgramsPage() {
  const { t } = useLanguage();
  const list = enabledPrograms();

  return (
    <>
      <Seo title={t.programs.title} description={t.programs.sub} path="/programs" />
      <PageHero label={t.programs.label} title={t.programs.title} description={t.programs.sub} />
      <div className="container">
        <Breadcrumbs items={[{ label: t.programs.title }]} />
      </div>

      <section className="section">
        <div className="container">
          {list.length > 0 ? (
            <div className="card-grid card-grid--3">
              {list.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              message={t.programs.empty}
              action={{ label: t.common.contactUs, to: '/contact' }}
            />
          )}
        </div>
      </section>
    </>
  );
}
