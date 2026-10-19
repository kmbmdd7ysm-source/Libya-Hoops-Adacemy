import { useLanguage } from '../context/LanguageContext';
import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import Breadcrumbs from '../components/common/Breadcrumbs';
import TrainingCard from '../components/training/TrainingCard';
import EmptyState from '../components/common/EmptyState';
import { onlineTraining, suppliedTrainingPrograms } from '../data/onlineTraining';

export default function OnlineTrainingPage() {
  const { t, pick } = useLanguage();
  const readyPrograms = onlineTraining.filter((program) => program.available !== false);
  const upcomingPrograms = onlineTraining.filter((program) => program.available === false);

  return (
    <>
      <Seo title={t.training.title} description={t.training.sub} path="/online-training" />
      <PageHero label={t.training.label} title={t.training.title} description={t.training.sub} />
      <div className="container">
        <Breadcrumbs items={[{ label: t.training.title }]} />
      </div>

      <section className="section">
        <div className="container">
          <h2 className="section-title">
            {pick({ en: 'Training programs', ar: 'برامج التدريب' })}
          </h2>
          <p className="section-subtitle">
            {pick({
              en: 'Explore available basketball training plans and choose the duration that fits your goals.',
              ar: 'اكتشف برامج التدريب المتاحة واختر المدة المناسبة لأهدافك.',
            })}
          </p>
          {readyPrograms.length > 0 ? (
            <div className="card-grid card-grid--3">
              {readyPrograms.map((program) => (
                <TrainingCard key={program.id} program={program} />
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

      {(upcomingPrograms.length > 0 || suppliedTrainingPrograms.length > 0) && (
        <section className="section" aria-label={pick({ en: 'Upcoming training systems', ar: 'أنظمة تدريب قادمة' })}>
          <div className="container">
            <h2 className="section-title">
              {pick({ en: 'Upcoming training systems', ar: 'أنظمة تدريب قادمة' })}
            </h2>
            <p className="section-subtitle">
              {pick({
                en: 'Preview programs in preparation. These are not available to purchase yet.',
                ar: 'تعرّف على الأنظمة قيد التجهيز. هذه البرامج غير متاحة للشراء حالياً.',
              })}
            </p>
            <div className="card-grid card-grid--3">
              {[...upcomingPrograms, ...suppliedTrainingPrograms].map((program) => (
                <TrainingCard key={program.id} program={program} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
