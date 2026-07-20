import { useLanguage } from '../context/LanguageContext';
import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import Breadcrumbs from '../components/common/Breadcrumbs';
import EventCard from '../components/events/EventCard';
import EmptyState from '../components/common/EmptyState';
import { upcomingEvents, pastEvents } from '../data/events';

export default function EventsPage() {
  const { t } = useLanguage();
  const upcoming = upcomingEvents();
  const past = pastEvents();

  return (
    <>
      <Seo title={t.events.title} description={t.events.sub} path="/events" />
      <PageHero label={t.events.label} title={t.events.title} description={t.events.sub} />
      <div className="container">
        <Breadcrumbs items={[{ label: t.events.title }]} />
      </div>

      <section className="section">
        <div className="container">
          <h2 className="section-title">{t.events.upcoming}</h2>
          {upcoming.length > 0 ? (
            <div className="card-grid card-grid--3">
              {upcoming.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <EmptyState
              message={t.events.empty}
              action={{ label: t.common.contactUs, to: '/contact' }}
            />
          )}
        </div>
      </section>

      {past.length > 0 && (
        <section className="section section--muted">
          <div className="container">
            <h2 className="section-title">{t.events.past}</h2>
            <div className="card-grid card-grid--3">
              {past.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
