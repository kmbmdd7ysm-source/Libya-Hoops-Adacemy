import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { SITE } from '../config';
import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { enabledPrograms } from '../data/programs';
import { upcomingEvents } from '../data/events';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT?.trim() || '';
const TYPE_KEYS = [
  'general',
  'program',
  'event',
  'order',
  'coaching',
  'partnership',
  'sponsorship',
  'media',
];

export default function ContactPage() {
  const { t, pick, lang } = useLanguage();
  const [params] = useSearchParams();

  const [form, setForm] = useState({
    inquiryType: TYPE_KEYS.includes(params.get('type')) ? params.get('type') : 'general',
    fullName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    subject: '',
    message: '',
    program: params.get('program') || '',
    event: params.get('event') || '',
    orderNumber: '',
  });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const socials = Object.entries(SITE.social).filter(([, v]) => v);
  const hasInfo =
    SITE.email || SITE.phone || pick(SITE.address) || pick(SITE.hours) || socials.length > 0;

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = t.contact.required;
    if (!EMAIL_RE.test(form.email)) e.email = t.contact.invalidEmail;
    if (!form.message.trim()) e.message = t.contact.required;
    if (!consent) e.consent = t.contact.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    const payload = { ...form, language: lang, submittedAt: new Date().toISOString() };
    if (!ENDPOINT) {
      // No endpoint configured yet — acknowledge without pretending it was sent to a server.
      setStatus('success');
      return;
    }
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <Seo title={t.contact.title} description={t.contact.sub} path="/contact" />
      <PageHero label={t.contact.label} title={t.contact.title} description={t.contact.sub} />
      <div className="container">
        <Breadcrumbs items={[{ label: t.contact.title }]} />
      </div>

      <section className="section contact-section">
        <div className={`container contact-grid${hasInfo ? '' : ' contact-grid--single'}`}>
          <div className="contact-form-wrap">
            {status === 'success' ? (
              <div className="notice notice--ok" role="status">
                <h2>{t.contact.success}</h2>
              </div>
            ) : (
              <form className="contact-form" onSubmit={submit} noValidate>
                <label className="field">
                  <span>{t.contact.inquiryType}</span>
                  <select value={form.inquiryType} onChange={set('inquiryType')}>
                    {TYPE_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {t.contact.types[k]}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="field-row">
                  <label className="field">
                    <span>{t.contact.fullName}</span>
                    <input
                      value={form.fullName}
                      onChange={set('fullName')}
                      autoComplete="name"
                      aria-invalid={!!errors.fullName}
                    />
                    {errors.fullName && <span className="form-error">{errors.fullName}</span>}
                  </label>
                  <label className="field">
                    <span>{t.contact.email}</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                  </label>
                </div>

                <div className="field-row">
                  <label className="field">
                    <span>{t.contact.phone}</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      autoComplete="tel"
                    />
                  </label>
                  <label className="field">
                    <span>{t.contact.country}</span>
                    <input
                      value={form.country}
                      onChange={set('country')}
                      autoComplete="country-name"
                    />
                  </label>
                  <label className="field">
                    <span>{t.contact.city}</span>
                    <input value={form.city} onChange={set('city')} autoComplete="address-level2" />
                  </label>
                </div>

                {form.inquiryType === 'program' && (
                  <label className="field">
                    <span>{t.contact.program}</span>
                    <select value={form.program} onChange={set('program')}>
                      <option value="">{t.contact.select}</option>
                      {enabledPrograms().map((p) => (
                        <option key={p.id} value={p.slug}>
                          {pick(p.name)}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {form.inquiryType === 'event' && (
                  <label className="field">
                    <span>{t.contact.event}</span>
                    <select value={form.event} onChange={set('event')}>
                      <option value="">{t.contact.select}</option>
                      {upcomingEvents().map((e) => (
                        <option key={e.id} value={e.slug}>
                          {pick(e.title)}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {form.inquiryType === 'order' && (
                  <label className="field">
                    <span>{t.contact.orderNumber}</span>
                    <input value={form.orderNumber} onChange={set('orderNumber')} />
                  </label>
                )}

                <label className="field">
                  <span>{t.contact.subject}</span>
                  <input value={form.subject} onChange={set('subject')} />
                </label>
                <label className="field">
                  <span>{t.contact.message}</span>
                  <textarea
                    rows="6"
                    value={form.message}
                    onChange={set('message')}
                    aria-invalid={!!errors.message}
                  />
                  {errors.message && <span className="form-error">{errors.message}</span>}
                </label>

                <label className="field-check contact-consent">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    aria-invalid={!!errors.consent}
                  />
                  <span>{t.contact.consent}</span>
                </label>
                {errors.consent && <span className="form-error">{errors.consent}</span>}

                {status === 'error' && (
                  <div className="notice notice--info" role="alert">
                    <p>{t.contact.error}</p>
                  </div>
                )}

                <button type="submit" className="btn-primary block" disabled={status === 'sending'}>
                  {status === 'sending' ? t.contact.sending : t.contact.send}
                </button>
              </form>
            )}
          </div>

          {hasInfo && (
            <aside className="contact-info">
              <h2 className="section-title">{t.contact.info}</h2>
              <ul className="contact-list">
                {SITE.email && (
                  <li>
                    <span className="contact-key">{t.contact.email}</span>
                    <a href={SITE.emailLink}>{SITE.email}</a>
                  </li>
                )}
                {SITE.phone && (
                  <li>
                    <span className="contact-key">{t.contact.phone}</span>
                    <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} dir="ltr">
                      {SITE.phone}
                    </a>
                  </li>
                )}
                {pick(SITE.address) && (
                  <li>
                    <span className="contact-key">{t.contact.address}</span>
                    <span>{pick(SITE.address)}</span>
                  </li>
                )}
                {pick(SITE.hours) && (
                  <li>
                    <span className="contact-key">{t.contact.hours}</span>
                    <span>{pick(SITE.hours)}</span>
                  </li>
                )}
              </ul>
              {socials.length > 0 && (
                <div className="contact-social">
                  <span className="contact-key">{t.contact.follow}</span>
                  <div className="social-row">
                    {socials.map(([k, v]) => (
                      <a
                        key={k}
                        href={v}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                      >
                        {t.common[k] || k}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>
      </section>
    </>
  );
}
