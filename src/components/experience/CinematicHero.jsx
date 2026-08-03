import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function CinematicHero() {
  const { t, pick } = useLanguage();
  const video = useRef(null);
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);

  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    setVideoEnabled(!reduced && !connection?.saveData);
  }, [reduced]);

  useEffect(() => {
    if (!videoEnabled || failed) return undefined;

    const element = video.current;
    if (!element) return undefined;

    const startPlayback = () => {
      element.play().catch(() => {
        // iOS can briefly reject autoplay while the page is settling.
        // Retry once on the first user interaction without showing controls.
        const retry = () => element.play().catch(() => {});
        window.addEventListener('touchstart', retry, { once: true, passive: true });
        window.addEventListener('pointerdown', retry, { once: true, passive: true });
      });
    };

    if (element.readyState >= 2) startPlayback();
    else element.addEventListener('canplay', startPlayback, { once: true });

    return () => element.removeEventListener('canplay', startPlayback);
  }, [videoEnabled, failed]);

  return (
    <section className="hero cinematic-hero">
      <div className="hero-media" aria-hidden="true">
        <picture className="hero-poster-picture">
          <source media="(max-width: 767px)" srcSet="/media/hero/lha-hero-poster-mobile.webp" />
          <img
            className="hero-poster"
            src="/media/hero/lha-hero-poster.webp"
            alt=""
            width="1940"
            height="1024"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        {videoEnabled && !failed && (
          <video
            ref={video}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            poster="/media/hero/lha-hero-poster.webp"
            width="1940"
            height="1024"
            onError={() => setFailed(true)}
          >
            <source src="/media/hero/lha-hero.mp4" type="video/mp4" />
          </video>
        )}
      </div>
      <div className="container hero-inner">
        <p className="hero-kicker">
          {pick({ en: 'Libya Hoops Academy', ar: 'أكاديمية ليبيا لكرة السلة' })}
        </p>
        <h1 className="hero-title display-title">
          {pick({
            en: (
              <>
                <span>OWN THE</span>
                <br />
                <span className="outline">GAME.</span>
              </>
            ),
            ar: (
              <>
                <span>امتلك</span>
                <br />
                <span className="outline">اللعبة.</span>
              </>
            ),
          })}
        </h1>
        <p className="hero-text">{t.home.heroText}</p>
        <div className="hero-actions">
          <Link to="/programs" className="btn-primary block">
            {t.common.explorePrograms}
          </Link>
          <Link to="/shop" className="btn-secondary block">
            {t.common.shopNow}
          </Link>
        </div>
      </div>
      <a className="hero-scroll" href="#home-story">
        <span className="sr-only">
          {pick({ en: 'Scroll to academy content', ar: 'انتقل إلى محتوى الأكاديمية' })}
        </span>
        <span className="hero-scroll-dot" aria-hidden="true" />
      </a>
    </section>
  );
}
