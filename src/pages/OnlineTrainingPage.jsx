import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import Breadcrumbs from '../components/common/Breadcrumbs';
import TrainingCard from '../components/training/TrainingCard';
import EmptyState from '../components/common/EmptyState';
import { onlineTraining, suppliedTrainingPrograms } from '../data/onlineTraining';
import { durationFilters, matchesTraining, trainingGoals } from '../data/trainingDiscovery';

export default function OnlineTrainingPage() {
  const { t, pick } = useLanguage();
  const [params, setParams] = useSearchParams();
  const requestedGoal = params.get('goal');
  const requestedDuration = params.get('duration');
  const goal = trainingGoals.some((item) => item.id === requestedGoal) ? requestedGoal : 'all';
  const duration = durationFilters.some((item) => item.id === requestedDuration) ? requestedDuration : 'all';

  const readyPrograms = onlineTraining.filter((program) => program.available !== false);
  const upcomingPrograms = onlineTraining.filter((program) => program.available === false);
  const filteredPrograms = readyPrograms.filter((program) => matchesTraining(program, goal, duration));
  // Keep both filters in the URL so a route remount, refresh or shared link
  // preserves the complete selection instead of silently resetting the goal.
  const changeFilter = (field, value) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value === 'all') next.delete(field);
      else next.set(field, value);
      return next;
    }, { replace: true });
  };
  const resetFilters = () => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.delete('goal');
      next.delete('duration');
      return next;
    }, { replace: true });
  };

  return (
    <>
      <Seo title={t.training.title} description={t.training.sub} path="/online-training" />
      <PageHero label={t.training.label} title={t.training.title} description={t.training.sub} />
      <div className="container">
        <Breadcrumbs items={[{ label: t.training.title }]} />
      </div>

      <section className="section training-discovery" aria-labelledby="training-ready-heading">
        <div className="container">
          <div className="training-discovery-intro">
            <div>
              <p className="section-label">{pick({ en: 'FIND YOUR SYSTEM', ar: 'اختار النظام المناسب' })}</p>
              <h2 id="training-ready-heading" className="section-title">
                {pick({ en: 'Train for your next level.', ar: 'تدرّب للمستوى الجاي.' })}
              </h2>
            </div>
            <p className="section-subtitle">
              {pick({
                en: 'Choose your goal, compare the actual program lengths and open a plan for full details. Only offered durations and prices appear.',
                ar: 'حدد هدفك، وقارن مدد البرامج الحقيقية، وافتح تفاصيل كل نظام. نعرض المدد والأسعار الموجودة فقط بدون إضافات.',
              })}
            </p>
          </div>

          <div className="training-discovery-controls">
            <div className="training-filter-block">
              <h3 className="training-filter-heading">{pick({ en: 'Training goal', ar: 'هدف التدريب' })}</h3>
              <div className="training-filter-options" role="group" aria-label={pick({ en: 'Filter by training goal', ar: 'فلتر حسب الهدف' })}>
                {trainingGoals.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={`training-filter-chip${goal === item.id ? ' is-active' : ''}`}
                    aria-pressed={goal === item.id}
                    onClick={() => changeFilter('goal', item.id)}
                  >
                    {pick(item.label)}
                  </button>
                ))}
              </div>
            </div>
            <div className="training-filter-block">
              <h3 className="training-filter-heading">{pick({ en: 'Program length', ar: 'مدة النظام' })}</h3>
              <div className="training-filter-options" role="group" aria-label={pick({ en: 'Filter by program duration', ar: 'فلتر حسب المدة' })}>
                {durationFilters.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={`training-filter-chip${duration === item.id ? ' is-active' : ''}`}
                    aria-pressed={duration === item.id}
                    onClick={() => changeFilter('duration', item.id)}
                  >
                    {pick(item.label)}
                  </button>
                ))}
              </div>
            </div>
            <div className="training-filter-summary">
              <p role="status" aria-live="polite">
                {pick({
                  en: `${filteredPrograms.length} of ${readyPrograms.length} available systems`,
                  ar: `${filteredPrograms.length} من ${readyPrograms.length} أنظمة متاحة`,
                })}
              </p>
              {(goal !== 'all' || duration !== 'all') && (
                <button type="button" className="training-clear-filters" onClick={resetFilters}>
                  {pick({ en: 'Clear filters', ar: 'امسح الفلاتر' })}
                </button>
              )}
            </div>
          </div>

          {filteredPrograms.length > 0 ? (
            <div className="card-grid card-grid--3 training-discovery-grid">
              {filteredPrograms.map((program) => <TrainingCard key={program.id} program={program} />)}
            </div>
          ) : (
            <div className="training-filter-empty">
              <p>{pick({
                en: 'No training system offers this exact goal and duration combination.',
                ar: 'ما فيش نظام يجمع الهدف والمدة هادو مع بعض حسب البرامج المتاحة حالياً.',
              })}</p>
              <button type="button" className="btn-secondary" onClick={resetFilters}>
                {pick({ en: 'Show all programs', ar: 'عرض كل الأنظمة' })}
              </button>
            </div>
          )}
        </div>
      </section>

      {upcomingPrograms.length > 0 && (
        <section className="section training-preview-section" aria-labelledby="training-upcoming-heading">
          <div className="container">
            <h2 id="training-upcoming-heading" className="section-title">
              {pick({ en: 'In Preparation', ar: 'قيد التجهيز' })}
            </h2>
            <p className="section-subtitle">
              {pick({
                en: 'These academy systems are being prepared and cannot be ordered yet.',
                ar: 'هذه الأنظمة قيد التجهيز وغير متاحة للطلب حالياً.',
              })}
            </p>
            <div className="card-grid card-grid--3">
              {upcomingPrograms.map((program) => <TrainingCard key={program.id} program={program} />)}
            </div>
          </div>
        </section>
      )}

      {suppliedTrainingPrograms.length > 0 && (
        <section className="section section--muted training-preview-section" aria-labelledby="training-sources-heading">
          <div className="container">
            <h2 id="training-sources-heading" className="section-title">
              {pick({ en: 'Training Files Under Review', ar: 'ملفات تدريب تحت المراجعة' })}
            </h2>
            <p className="section-subtitle">
              {pick({
                en: 'Source-file previews, not products for sale. Original content, distribution permission, pricing and secure delivery must be verified before release.',
                ar: 'هذه معاينات لملفات مصدر وليست منتجات للبيع. لازم نتأكد من المحتوى الأصلي وحقوق توزيعه والسعر وطريقة التسليم الآمنة قبل الإتاحة.',
              })}
            </p>
            <div className="card-grid card-grid--3">
              {suppliedTrainingPrograms.map((program) => <TrainingCard key={program.id} program={program} />)}
            </div>
          </div>
        </section>
      )}

      {readyPrograms.length === 0 && (
        <div className="container">
          <EmptyState message={t.training.empty} action={{ label: t.common.contactUs, to: '/contact' }} />
        </div>
      )}
    </>
  );
}
