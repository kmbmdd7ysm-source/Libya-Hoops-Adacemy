import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart, cartKey } from '../context/CartContext';
import { SITE } from '../config';
import { formatDate } from '../utils/format';
import { useCommerce } from '../context/CommerceContext';
import Seo from '../components/common/Seo';
import Breadcrumbs from '../components/common/Breadcrumbs';
import SmartImage from '../components/common/SmartImage';
import ShareButtons from '../components/common/ShareButtons';
import EventCard from '../components/events/EventCard';
import { getEvent, canRegister, isEventEnded, relatedEvents } from '../data/events';
import NotFoundPage from './NotFoundPage';
import { createEventRegistration, validateRegistrationInput } from '../services/eventRegistrations';
import { FULFILLMENT_TYPES } from '../utils/fulfillment';

export default function EventDetailPage() {
  const { slug } = useParams();
  const { t, pick, lang } = useLanguage();
  const { format } = useCommerce();
  const { addItem } = useCart();
  const event = getEvent(slug);
  const [registration, setRegistration] = useState({
    customerName: '',
    email: '',
    phone: '',
    participantName: '',
  });
  const [registrationState, setRegistrationState] = useState({ status: 'idle', message: '' });
  const [registrationErrors, setRegistrationErrors] = useState({});
  const registrationDetailsRef = useRef(null);

  if (!event) return <NotFoundPage />;

  const ended = isEventEnded(event);
  const open = canRegister(event);
  const full = event.status === 'full' || event.remaining <= 0;
  const isFree = !event.price || event.price === 0;
  const crumbs = [{ label: t.events.title, to: '/events' }, { label: pick(event.title) }];
  const related = relatedEvents(event);

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

  const register = async (submitEvent) => {
    submitEvent.preventDefault();
    if (!open || registrationState.status === 'submitting') return;
    const idempotencyKey = globalThis.crypto?.randomUUID?.() || `${event.id}-${Date.now()}`;
    try {
      validateRegistrationInput(registration);
      setRegistrationErrors({});
      setRegistrationState({ status: 'submitting', message: '' });
      const result = await createEventRegistration(event.id, registration, idempotencyKey);
      if (isFree) {
        setRegistrationState({
          status: 'confirmed',
          message:
            lang === 'ar'
              ? 'تم تأكيد تسجيلك في الفعالية.'
              : 'Your event registration is confirmed.',
        });
        return;
      }
      addItem({
        key: cartKey('event', event.id, result.registration_id),
        type: 'event',
        fulfillmentType: FULFILLMENT_TYPES.EVENT_REGISTRATION,
        id: event.id,
        slug: event.slug,
        name: event.title,
        image: event.coverImage,
        price: Number(result.trusted_price),
        href: `/events/${event.slug}`,
        quantity: 1,
        registrationId: result.registration_id,
        participantName: registration.participantName || registration.customerName,
      });
      setRegistrationState({
        status: 'pending_payment',
        message:
          lang === 'ar'
            ? 'التسجيل بانتظار الدفع. أكمل الدفع من السلة.'
            : 'Registration pending payment. Complete payment from your cart.',
      });
    } catch (error) {
      const code = error?.message || '';
      registrationDetailsRef.current?.setAttribute('open', '');
      if (code === 'invalid_registration_name') {
        setRegistrationErrors({
          customerName: lang === 'ar' ? 'يرجى إدخال اسم صحيح.' : 'Enter a valid name.',
        });
        setRegistrationState({ status: 'idle', message: '' });
        return;
      }
      if (code === 'invalid_registration_email') {
        setRegistrationErrors({
          email: lang === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Enter a valid email address.',
        });
        setRegistrationState({ status: 'idle', message: '' });
        return;
      }
      if (!isFree) {
        addItem({
          key: cartKey('event', event.id, idempotencyKey),
          type: 'event',
          fulfillmentType: FULFILLMENT_TYPES.EVENT_REGISTRATION,
          id: event.id,
          slug: event.slug,
          name: event.title,
          image: event.coverImage,
          price: Number(event.price),
          href: `/events/${event.slug}`,
          quantity: 1,
          registrationId: null,
          registrationDraft: validateRegistrationInput(registration),
          participantName: registration.participantName || registration.customerName,
        });
        setRegistrationState({
          status: 'pending_payment',
          message:
            lang === 'ar'
              ? 'تمت إضافة التسجيل إلى السلة. أكمل الدفع من السلة.'
              : 'Registration added to cart. Complete payment from your cart.',
        });
        return;
      }
      setRegistrationState({
        status: 'error',
        message:
          lang === 'ar'
            ? 'تعذر إكمال التسجيل مؤقتاً. حاول مرة أخرى.'
            : 'Registration is temporarily unavailable. Try again.',
      });
    }
  };

  const facts = [
    {
      label: t.events.date,
      value: `${formatDate(event.startDate, lang)}${event.endDate && event.endDate !== event.startDate ? ' – ' + formatDate(event.endDate, lang) : ''}`,
    },
    (event.startTime || event.endTime) && {
      label: t.events.time,
      value: [event.startTime, event.endTime].filter(Boolean).join(' – '),
    },
    event.venue && { label: t.events.location, value: pick(event.venue) },
    event.ageGroup && { label: t.events.ageGroup, value: pick(event.ageGroup) },
    event.level && { label: t.events.level, value: pick(event.level) },
    event.capacity && { label: t.events.capacity, value: String(event.capacity) },
  ].filter(Boolean);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: pick(event.title),
      description: pick(event.description),
      startDate: event.startDate,
      endDate: event.endDate || event.startDate,
      eventStatus: ended
        ? 'https://schema.org/EventScheduled'
        : 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: pick(event.venue), address: pick(event.address) },
      image: `${SITE.domain}${event.coverImage}`,
      organizer: {
        '@type': 'Organization',
        name: event.organizer ? pick(event.organizer) : SITE.name,
        url: SITE.domain,
      },
      offers: {
        '@type': 'Offer',
        price: event.price || 0,
        priceCurrency: SITE.currency,
        availability: open ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
        url: `${SITE.domain}/events/${event.slug}`,
      },
    },
  ];

  return (
    <>
      <Seo
        title={pick(event.title)}
        description={pick(event.description)}
        path={`/events/${event.slug}`}
        image={event.coverImage}
        type="article"
        jsonLd={jsonLd}
      />
      <div className="container">
        <Breadcrumbs items={crumbs} />
      </div>

      <section className="section detail-hero">
        <div className="container detail-hero-grid">
          <div className="detail-media">
            <SmartImage
              src={event.coverImage}
              alt={pick(event.title)}
              eager
              className="detail-image"
            />
          </div>
          <div className="detail-intro">
            <p className="section-label">{t.events.label}</p>
            <h1 className="detail-title">{pick(event.title)}</h1>
            <p className="lead">{pick(event.description)}</p>
            <dl className="fact-list">
              {facts.map((f, i) => (
                <div key={i} className="fact">
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
              <div className="fact">
                <dt>{t.events.price}</dt>
                <dd>{isFree ? t.events.free : format(event.price, lang)}</dd>
              </div>
            </dl>

            <div className="detail-cta">
              {ended ? (
                <span className="status-pill ended">{t.events.ended}</span>
              ) : full ? (
                <span className="status-pill full">{t.events.full}</span>
              ) : open ? (
                <form className="event-registration" onSubmit={register} noValidate>
                  <p className="spaces-left">
                    {event.remaining} {t.events.spacesLeft}
                  </p>
                  <details ref={registrationDetailsRef}>
                    <summary>{lang === 'ar' ? 'بيانات التسجيل' : 'Registration details'}</summary>
                    <div className="event-registration-fields">
                      <label className="field">
                        <span>{lang === 'ar' ? 'الاسم' : 'Name'}</span>
                        <input
                          required
                          autoComplete="name"
                          value={registration.customerName}
                          aria-invalid={Boolean(registrationErrors.customerName)}
                          onChange={(e) =>
                            setRegistration((v) => ({ ...v, customerName: e.target.value }))
                          }
                        />
                        {registrationErrors.customerName && (
                          <span className="form-error">{registrationErrors.customerName}</span>
                        )}
                      </label>
                      <label className="field">
                        <span>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</span>
                        <input
                          required
                          type="email"
                          autoComplete="email"
                          value={registration.email}
                          aria-invalid={Boolean(registrationErrors.email)}
                          onChange={(e) =>
                            setRegistration((v) => ({ ...v, email: e.target.value }))
                          }
                        />
                        {registrationErrors.email && (
                          <span className="form-error">{registrationErrors.email}</span>
                        )}
                      </label>
                      <label className="field">
                        <span>{lang === 'ar' ? 'رقم الهاتف' : 'Phone'}</span>
                        <input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={registration.phone}
                          onChange={(e) =>
                            setRegistration((v) => ({ ...v, phone: e.target.value }))
                          }
                        />
                      </label>
                      <label className="field">
                        <span>
                          {lang === 'ar'
                            ? 'اسم المشارك (إن كان مختلفاً)'
                            : 'Participant name (if different)'}
                        </span>
                        <input
                          autoComplete="name"
                          value={registration.participantName}
                          onChange={(e) =>
                            setRegistration((v) => ({ ...v, participantName: e.target.value }))
                          }
                        />
                      </label>
                    </div>
                  </details>
                  <button
                    type="submit"
                    className="btn-primary block event-registration-cta"
                    disabled={registrationState.status === 'submitting'}
                  >
                    {isFree
                      ? lang === 'ar'
                        ? 'احجز مكانك'
                        : 'Reserve your place'
                      : lang === 'ar'
                        ? 'أضف التسجيل للسلة'
                        : 'Add registration to cart'}
                  </button>
                  {registrationState.message && (
                    <p
                      className={`notice ${registrationState.status === 'error' ? 'notice--error' : 'notice--muted'}`}
                      role="status"
                    >
                      {registrationState.message}
                    </p>
                  )}
                </form>
              ) : (
                <span className="status-pill closed">{t.events.closed}</span>
              )}
              {event.mapLink && (
                <a
                  href={event.mapLink}
                  className="btn-secondary block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.events.map}
                </a>
              )}
            </div>
            <ShareButtons
              title={pick(event.title)}
              text={pick(event.description)}
              label={t.common.share}
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container detail-body">
          <div className="detail-lists">
            {renderList(t.events.included, event.included)}
            {renderList(t.events.bring, event.bring)}
            {event.organizer && (
              <div className="detail-list-block">
                <h3>{t.events.organizer}</h3>
                <p>{pick(event.organizer)}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--muted">
          <div className="container">
            <h2 className="section-title">{t.events.related}</h2>
            <div className="card-grid card-grid--3">
              {related.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
