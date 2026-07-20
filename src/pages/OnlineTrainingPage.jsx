import { useLanguage } from '../context/LanguageContext';
import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import Breadcrumbs from '../components/common/Breadcrumbs';
import TrainingCard from '../components/training/TrainingCard';
import EmptyState from '../components/common/EmptyState';
import { onlineTraining } from '../data/onlineTraining';

export default function OnlineTrainingPage() {
  const { t } = useLanguage();

  return (
    <>
      <Seo title={t.training.title} description={t.training.sub} path="/online-training" />
      <PageHero label={t.training.label} title={t.training.title} description={t.training.sub} />
      <div className="container">
        <Breadcrumbs items={[{ label: t.training.title }]} />
      </div>

      <section className="section">
        <div className="container">
          {onlineTraining.length > 0 ? (
            <div className="card-grid card-grid--3">
              {onlineTraining.map((p) => (
                <TrainingCard key={p.id} program={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              message={t.training.empty}
              action={{ label: t.common.contactUs, to: '/contact' }}
            />
          )}
        </div>
      </section>
    </>
  );
}
