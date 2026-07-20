import Icon from '../icons/Icon';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroDepth from './HeroDepth';
import { useLanguage } from '../../context/LanguageContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
export default function CinematicHero() {
  const { t, pick } = useLanguage();
  const video = useRef(null);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [canPlayVideo, setCanPlayVideo] = useState(true);
  const reduced = useReducedMotion();
  useEffect(() => {
    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const saveData = Boolean(connection?.saveData);
    setCanPlayVideo(!reduced && !saveData);
  }, [reduced]);

  useEffect(() => {
    if (!canPlayVideo || failed) return;
    video.current?.play().catch(() => setPaused(true));
  }, [canPlayVideo, failed]);
  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };
  return (
    <section className="hero cinematic-hero">
      <div className="hero-media" aria-hidden="true">
        <img
          className="hero-poster"
          src="/media/hero/lha-hero-poster.jpg"
          alt=""
          width="1940"
          height="1024"
        />
        {canPlayVideo && !failed && (
          <video
            ref={video}
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            poster="/media/hero/lha-hero-poster.jpg"
            onError={() => setFailed(true)}
          >
            <source src="/media/hero/lha-hero.mp4" type="video/mp4" />
            Your browser does not support background video.
          </video>
        )}
        <HeroDepth />
        <span className="hero-vignette" />
        <span className="hero-noise" />
      </div>
      <div className="container hero-inner">
        <p className="hero-kicker">
          {pick({ en: 'Libya Hoops Academy', ar: 'أكاديمية ليبيا لكرة السلة' })}
        </p>
        <h1 className="hero-title display-title">
          {pick({
            en: (
              <>
                OWN THE
                <br />
                <span className="outline">GAME.</span>
              </>
            ),
            ar: (
              <>
                امتلك
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
      {canPlayVideo && !failed && (
        <button
          type="button"
          className="hero-video-control"
          onClick={toggle}
          aria-label={paused ? 'Play background video' : 'Pause background video'}
        >
          <Icon name={paused ? 'play' : 'pause'} size={20} />
        </button>
      )}
      <a className="hero-scroll" href="#home-story" aria-label="Scroll to content">
        <span />
      </a>
    </section>
  );
}
