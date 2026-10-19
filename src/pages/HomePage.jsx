import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { SITE } from '../config';
import Seo, { organizationSchema } from '../components/common/Seo';
import CinematicHero from '../components/experience/CinematicHero';

const HomeDeferredContent = lazy(() => import('./HomeDeferredContent'));

const pathways = [
  {
    id: 'court',
    href: '/programs',
    image: '/images/programs/elite-development.webp',
    title: { en: 'On-Court Training', ar: 'التدريب في الملعب' },
    description: {
      en: 'Develop your fundamentals, decision-making and performance through academy programs.',
      ar: 'طوّر أساسياتك وقراراتك وأداءك من خلال برامج الأكاديمية.',
    },
    action: { en: 'Explore Programs', ar: 'اكتشف البرامج' },
  },
  {
    id: 'digital',
    href: '/online-training',
    image: '/images/training/full-body-strength.jpg',
    title: { en: 'Train Anywhere', ar: 'تدرّب من أي مكان' },
    description: {
      en: 'Structured training plans to help you stay consistent beyond the court.',
      ar: 'أنظمة تدريب منظمة تساعدك تستمر في التطور حتى خارج الملعب.',
    },
    action: { en: 'View Online Training', ar: 'شوف التدريب أونلاين' },
  },
  {
    id: 'culture',
    href: '/shop',
    image: '/images/categories/clothing-hero-player.webp',
    title: { en: 'Carry the Culture', ar: 'عيش ثقافة اللعبة' },
    description: {
      en: 'Academy gear and essentials for the work you put in every day.',
      ar: 'ملابس ومستلزمات الأكاديمية لكل يوم تتمرن فيه وتطوّر مستواك.',
    },
    action: { en: 'Explore the Store', ar: 'تسوّق المنتجات' },
  },
];

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
      { rootMargin: '280px 0px', threshold: 0 },
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
  const { pick, t } = useLanguage();

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
        className="brand-proof home-v2-proof"
        aria-label={pick({ en: 'Academy purpose', ar: 'هدف الأكاديمية' })}
      >
        <div className="container brand-proof-grid">
          <p>
            {pick({ en: 'BUILT IN LIBYA. MADE FOR THE GAME.', ar: 'من ليبيا. ومن أجل اللعبة.' })}
          </p>
          <span>
            {pick({ en: 'DEVELOP · PERFORM · BELONG', ar: 'تطوّر · قدّم الأفضل · انتمِ' })}
          </span>
        </div>
      </section>

      <section id="home-paths" className="home-v2-paths section" aria-labelledby="home-paths-title">
        <div className="container">
          <div className="home-v2-paths-head">
            <div>
              <p className="section-label">{pick({ en: 'START HERE', ar: 'ابدأ من هنا' })}</p>
              <h2 id="home-paths-title" className="section-title">
                {pick({ en: 'YOUR GAME. YOUR PATH.', ar: 'لعبتك. طريقك.' })}
              </h2>
            </div>
            <p>
              {pick({
                en: 'On the court, at home, and in the everyday moments that make a player.',
                ar: 'في الملعب، وفي البيت، وفي التفاصيل اليومية اللي تصنع اللاعب.',
              })}
            </p>
          </div>
          <div className="home-v2-path-grid">
            {pathways.map((path) => (
              <Link to={path.href} className="home-v2-path" key={path.id} data-path={path.id}>
                <img
                  src={path.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  width="800"
                  height="1000"
                />
                <span className="home-v2-path-shade" aria-hidden="true" />
                <span className="home-v2-path-content">
                  <span className="home-v2-path-index">
                    {path.id === 'court' ? '01' : path.id === 'digital' ? '02' : '03'}
                  </span>
                  <strong>{pick(path.title)}</strong>
                  <span className="home-v2-path-description">{pick(path.description)}</span>
                  <span className="home-v2-path-action">
                    {pick(path.action)}
                    <span aria-hidden="true">↗</span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <DeferredHomeContent />
    </>
  );
}
