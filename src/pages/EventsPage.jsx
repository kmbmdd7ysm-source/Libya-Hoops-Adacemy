import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import Breadcrumbs from '../components/common/Breadcrumbs';
import EventCard from '../components/events/EventCard';
import { upcomingEvents, pastEvents } from '../data/events';

export default function EventsPage() {
  const { t, pick } = useLanguage();
  const upcoming = upcomingEvents();
  const past = pastEvents();

  return (
    <>
      <Seo title={t.events.title} description={t.events.sub} path="/events" />
      <PageHero label={t.events.label} title={t.events.title} description={t.events.sub} />
      <div className="container"><Breadcrumbs items={[{ label: t.events.title }]} /></div>

      <section className="section" aria-labelledby="events-upcoming-title">
        <div className="container">
          <div className="academy-editorial-heading">
            <div>
              <p className="section-label">{pick({ en: 'ACADEMY EVENTS', ar: 'فعاليات الأكاديمية' })}</p>
              <h2 id="events-upcoming-title" className="section-title">{t.events.upcoming}</h2>
            </div>
            <p>{pick({
              en: 'Camps, clinics and basketball events will appear here only after their dates and registration details are confirmed.',
              ar: 'المعسكرات والورش والفعاليات تظهر هنا بعد التأكد من المواعيد وتفاصيل التسجيل.',
            })}</p>
          </div>

          {upcoming.length > 0 ? (
            <div className="card-grid card-grid--3">
              {upcoming.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          ) : (
            <div className="academy-event-status">
              <div className="academy-event-status-media">
                <img src="/images/programs/camps.webp" alt="" width="1408" height="768"
                  loading="lazy" decoding="async" />
              </div>
              <div className="academy-event-status-copy">
                <p className="section-label">{pick({ en: 'NO CONFIRMED DATES YET', ar: 'لا توجد مواعيد مؤكدة حالياً' })}</p>
                <h3>{pick({ en: 'THE NEXT SESSION STARTS WITH A PLAN.', ar: 'الجلسة الجاية تبدأ بخطة.' })}</h3>
                <p>{pick({
                  en: 'There are no verified upcoming event dates available for registration right now. You can still explore academy training or contact us for the latest information.',
                  ar: 'حالياً ما فيش مواعيد فعاليات مؤكدة ومتاحة للتسجيل. تقدر تشوف برامج التدريب أو تتواصل معانا للاستفسار عن الجديد.',
                })}</p>
                <div className="academy-editorial-actions">
                  <Link to="/programs" className="btn-primary">
                    {pick({ en: 'Explore Programs', ar: 'اكتشف البرامج' })}
                  </Link>
                  <Link to="/contact" className="btn-secondary">
                    {pick({ en: 'Ask About Events', ar: 'استفسر عن الفعاليات' })}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      {past.length > 0 && (
        <section className="section section--muted" aria-labelledby="events-past-title">
          <div className="container">
            <h2 id="events-past-title" className="section-title">{t.events.past}</h2>
            <div className="card-grid card-grid--3">
              {past.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
