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
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    setVideoEnabled(!reduced && !connection?.saveData);
  }, [reduced]);

  useEffect(() => {
    if (!videoEnabled || failed || paused) return undefined;
    const element = video.current;
    if (!element) return undefined;

    const startPlayback = () => {
      element.play().catch(() => {
        // Some mobile browsers block autoplay. The poster stays visible,
        // and a visitor can still deliberately start the video.
      });
    };

    if (element.readyState >= 2) startPlayback();
    else element.addEventListener('canplay', startPlayback, { once: true });
    return () => element.removeEventListener('canplay', startPlayback);
  }, [videoEnabled, failed, paused]);

  const togglePlayback = () => {
    const element = video.current;
    if (!element) return;
    if (paused) {
      setPaused(false);
      element.play().catch(() => setPaused(true));
    } else {
      element.pause();
      setPaused(true);
    }
  };

  return (
    <section
      className="hero cinematic-hero home-v2-hero"
      aria-label={pick({ en: 'Libya Hoops Academy', ar: 'ليبيا هوبس أكاديمي' })}
    >
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

      <div className="hero-editorial-rail" aria-hidden="true">
        <span>01 / 03</span>
        <span>{pick({ en: 'TRAIN. EVOLVE. REPEAT.', ar: 'تدرّب. تطوّر. كرّر.' })}</span>
      </div>

      <div className="container hero-inner">
        <p className="hero-kicker">
          {pick({ en: 'LIBYA HOOPS ACADEMY', ar: 'ليبيا هوبس أكاديمي' })}
        </p>
        <h1 className="hero-title display-title">
          {pick({
            en: (
              <>
                <span>BUILT TO</span>
                <br />
                <span className="outline">HOOP.</span>
              </>
            ),
            ar: (
              <>
                <span>طوّر</span>
                <br />
                <span className="outline">لعبتك.</span>
              </>
            ),
          })}
        </h1>
        <p className="hero-text">
          {pick({
            en: 'Real work. Real growth. On court and beyond.',
            ar: 'تدريب يصنع الفرق. في الملعب وخارجه.',
          })}
        </p>
        <div className="hero-actions home-v2-hero-actions">
          <Link to="/programs" className="btn-primary block">
            {t.common.explorePrograms}
          </Link>
          <Link to="/online-training" className="btn-secondary block">
            {pick({ en: 'Online Training', ar: 'التدريب أونلاين' })}
          </Link>
          <Link to="/shop/clothing" className="home-v2-hero-shop">
            {pick({ en: 'Shop the Collection', ar: 'تسوّق المجموعة' })}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>

      {videoEnabled && !failed && (
        <button
          type="button"
          className="home-v2-video-toggle"
          onClick={togglePlayback}
          aria-label={
            paused
              ? pick({ en: 'Play background video', ar: 'تشغيل فيديو الخلفية' })
              : pick({ en: 'Pause background video', ar: 'إيقاف فيديو الخلفية مؤقتاً' })
          }
        >
          {paused
            ? pick({ en: 'PLAY FILM', ar: 'تشغيل' })
            : pick({ en: 'PAUSE FILM', ar: 'إيقاف' })}
        </button>
      )}
      <a className="hero-scroll" href="#home-paths">
        <span className="sr-only">
          {pick({ en: 'Explore training and store paths', ar: 'استكشف خيارات التدريب والمتجر' })}
        </span>
        <span className="hero-scroll-dot" aria-hidden="true" />
      </a>
    </section>
  );
}
