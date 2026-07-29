import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function CinematicHero() {
  const { t, pick } = useLanguage();
  const video = useRef(null);
  const [failed, setFailed] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection?.saveData) return undefined;

    const enable = () => setVideoEnabled(true);
    const options = { once: true, passive: true };
    window.addEventListener('pointerdown', enable, options);
    window.addEventListener('touchstart', enable, options);
    window.addEventListener('scroll', enable, options);
    window.addEventListener('keydown', enable, { once: true });
    return () => {
      window.removeEventListener('pointerdown', enable);
      window.removeEventListener('touchstart', enable);
      window.removeEventListener('scroll', enable);
      window.removeEventListener('keydown', enable);
    };
  }, [reduced]);

  useEffect(() => {
    if (!videoEnabled || failed) return;
    video.current?.play().catch(() => {});
  }, [videoEnabled, failed]);

  return (
    <section className="hero cinematic-hero">
      <div className="hero-media" aria-hidden="true">
        <img
          className="hero-poster"
          src="/media/hero/lha-hero-poster.webp"
          alt=""
          width="1940"
          height="1024"
          fetchPriority="high"
          decoding="async"
        />
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
            en: <><span>OWN THE</span><br /><span className="outline">GAME.</span></>,
            ar: <><span>امتلك</span><br /><span className="outline">اللعبة.</span></>,
          })}
        </h1>
        <p className="hero-text">{t.home.heroText}</p>
        <div className="hero-actions">
          <Link to="/programs" className="btn-primary block">{t.common.explorePrograms}</Link>
          <Link to="/shop" className="btn-secondary block">{t.common.shopNow}</Link>
        </div>
      </div>
      <a className="hero-scroll" href="#home-story" aria-label="Scroll to content"><span /></a>
    </section>
  );
}
