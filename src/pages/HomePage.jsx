import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SITE } from '../config';
import Seo, { organizationSchema } from '../components/common/Seo';
import CinematicHero from '../components/experience/CinematicHero';

const HomeDeferredContent = lazy(() => import('./HomeDeferredContent'));

function DeferredHomeContent() {
  const anchorRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor || ready) return undefined;
    if (!('IntersectionObserver' in globalThis)) {
      setReady(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setReady(true);
        observer.disconnect();
      },
      { rootMargin: '96px 0px', threshold: 0 },
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [ready]);

  return (
    <div ref={anchorRef} className={`home-deferred-anchor${ready ? ' is-ready' : ''}`}>
      {ready && (
        <Suspense fallback={null}>
          <HomeDeferredContent />
        </Suspense>
      )}
    </div>
  );
}

export default function HomePage() {
  const { t, pick } = useLanguage();
  const stats = [
    [
      { en: 'Elite', ar: 'نخبة' },
      { en: 'Player Development', ar: 'تطوير اللاعبين' },
    ],
    [
      { en: '360°', ar: '360°' },
      { en: 'Complete Training', ar: 'تدريب متكامل' },
    ],
    [
      { en: 'Libya', ar: 'ليبيا' },
      { en: 'Built for the Future', ar: 'نبني للمستقبل' },
    ],
    [
      { en: 'LHA', ar: 'LHA' },
      { en: 'Own The Game', ar: 'امتلك اللعبة' },
    ],
  ];

  return (
    <>
      <Seo
        title={`${SITE.name} — ${pick(SITE.slogan)}`}
        description={t.home.heroText}
        path="/"
        jsonLd={organizationSchema()}
      />

      <CinematicHero />

      <section
        id="home-story"
        className="brand-proof"
        aria-label={pick({ en: 'Academy promise', ar: 'وعد الأكاديمية' })}
      >
        <div className="container brand-proof-grid">
          <p>
            {pick({
              en: 'Built in Libya. Designed for the world.',
              ar: 'نبني في ليبيا. وننافس العالم.',
            })}
          </p>
          <span>
            {pick({ en: 'DEVELOPMENT · PERFORMANCE · CULTURE', ar: 'تطوير · أداء · ثقافة' })}
          </span>
        </div>
      </section>

      <section className="performance-strip" aria-label="Academy highlights">
        <div className="container performance-grid">
          {stats.map(([value, label]) => (
            <div className="performance-item" key={value.en}>
              <strong>{pick(value)}</strong>
              <span>{pick(label)}</span>
            </div>
          ))}
        </div>
      </section>

      <DeferredHomeContent />
    </>
  );
}
