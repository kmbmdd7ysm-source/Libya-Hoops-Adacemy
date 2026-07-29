import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { formatDate } from '../../utils/format';
import { isEventEnded, canRegister } from '../../data/events';
import SmartImage from '../common/SmartImage';
import Badge from '../common/Badge';
import Price from '../common/Price';

export default function EventCard({ event }) {
  const { t, pick, lang } = useLanguage();
  const to = `/events/${event.slug}`;
  const comingSoon = event.comingSoon === true;
  const ended = !comingSoon && isEventEnded(event);
  const full = event.remaining <= 0 && !ended;
  return (
    <article className="event-card">
      <Link to={to} className="event-card-media" aria-label={pick(event.title)}>
        <SmartImage src={event.coverImage} alt={pick(event.title)} className="event-card-img" eager />
        <div className="event-card-badges">
          {comingSoon && <Badge tone="limited">{pick({ en: 'Coming Soon', ar: 'قريباً' })}</Badge>}
          {!comingSoon && ended && <Badge tone="sold">{t.events.ended}</Badge>}
          {!comingSoon && full && <Badge tone="limited">{t.events.full}</Badge>}
          {!comingSoon && !ended && !full && event.price === 0 && <Badge tone="free">{t.badge.free}</Badge>}
        </div>
      </Link>
      <div className="event-card-body">
        <span className="event-card-date">{comingSoon ? pick({ en: 'Date to be announced', ar: 'سيتم إعلان الموعد قريباً' }) : formatDate(event.startDate, lang)}</span>
        <Link to={to} className="event-card-title">
          {pick(event.title)}
        </Link>
        {!comingSoon && <ul className="event-card-meta">
          <li>
            {event.startTime}
            {event.endTime ? `–${event.endTime}` : ''}
          </li>
          <li>{pick(event.venue)}</li>
          <li>{pick(event.ageGroup)}</li>
        </ul>}
        <div className="event-card-foot">
          {comingSoon ? (
            <span className="event-free">{pick({ en: 'Coming Soon', ar: 'قريباً' })}</span>
          ) : event.price > 0 ? (
            <Price amount={event.price} size="sm" />
          ) : (
            <span className="event-free">{t.events.free}</span>
          )}
          {!comingSoon && !ended && !full && canRegister(event) && (
            <span className="event-spaces">
              {event.remaining} {t.events.spacesLeft}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
