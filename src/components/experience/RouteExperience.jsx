import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
export default function RouteExperience({ children }) {
  const loc = useLocation();
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove('route-enter');
    void el.offsetWidth;
    el.classList.add('route-enter');
    const h = document.querySelector('h1');
    if (h) {
      h.tabIndex = -1;
      h.focus({ preventScroll: true });
    }
    const live = document.getElementById('route-announcer');
    if (live) live.textContent = document.title;
  }, [loc.pathname]);
  return (
    <>
      <div id="route-announcer" className="sr-only" aria-live="polite" />
      <div ref={ref} key={loc.pathname} className="route-shell">
        {children}
      </div>
    </>
  );
}
